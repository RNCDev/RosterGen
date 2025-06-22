import { sql } from '@vercel/postgres';
import { 
    type PlayerDB, 
    type PlayerInput,
    type EventDB,
    type EventInput,
    type EventWithStats,
    type AttendanceDB,
    type AttendanceInput,
    type PlayerWithAttendance
} from '@/types/PlayerTypes';

export async function getPlayers(groupCode: string): Promise<PlayerDB[]> {
    const { rows } = await sql<PlayerDB>`
        SELECT * FROM players 
        WHERE group_code = ${groupCode} AND is_active = true
        ORDER BY first_name, last_name
    `;
    return rows;
}

export async function createPlayer(player: PlayerInput): Promise<PlayerDB> {
    const { rows } = await sql<PlayerDB>`
        INSERT INTO players (
            first_name, 
            last_name, 
            skill, 
            is_defense, 
            is_attending, 
            group_code
        )
        VALUES (
            ${player.first_name}, 
            ${player.last_name}, 
            ${player.skill}, 
            ${player.is_defense}, 
            ${player.is_attending}, 
            ${player.group_code}
        )
        RETURNING *;
    `;
    return rows[0];
}

export async function updatePlayer(player: PlayerDB): Promise<PlayerDB> {
    const { rows } = await sql<PlayerDB>`
        UPDATE players 
        SET 
            first_name = ${player.first_name}, 
            last_name = ${player.last_name}, 
            skill = ${player.skill}, 
            is_defense = ${player.is_defense},
            is_attending = ${player.is_attending},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${player.id}
        RETURNING *;
    `;
    return rows[0];
}

export async function deletePlayer(id: number, groupCode: string): Promise<boolean> {
    const { rowCount } = await sql`
        UPDATE players 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} AND group_code = ${groupCode};
    `;
    return rowCount > 0;
}

export async function bulkUpdatePlayers(
    groupCode: string,
    playersToCreate: Omit<PlayerDB, 'id' | 'created_at' | 'updated_at' | 'is_active'>[],
    playersToUpdate: PlayerDB[],
    playersToDelete: number[]
) {
    const client = await sql.connect();
    try {
        await client.query('BEGIN');

        if (playersToDelete.length > 0) {
            await client.query('DELETE FROM players WHERE id = ANY($1::int[]) AND group_code = $2', [playersToDelete, groupCode]);
        }

        if (playersToUpdate.length > 0) {
            for (const player of playersToUpdate) {
                await client.query(
                    `UPDATE players SET first_name = $1, last_name = $2, skill = $3, is_defense = $4, is_attending = $5, updated_at = CURRENT_TIMESTAMP
                     WHERE id = $6 AND group_code = $7`,
                    [player.first_name, player.last_name, player.skill, player.is_defense, player.is_attending, player.id, groupCode]
                );
            }
        }

        if (playersToCreate.length > 0) {
            for (const player of playersToCreate) {
                await client.query(
                    `INSERT INTO players (first_name, last_name, skill, is_defense, is_attending, group_code)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [player.first_name, player.last_name, player.skill, player.is_defense, player.is_attending, groupCode]
                );
            }
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in bulk player update transaction:', error);
        throw error;
    } finally {
        client.release();
    }
}

export async function bulkInsertPlayers(groupCode: string, players: PlayerInput[]): Promise<PlayerDB[]> {
    const createdPlayers: PlayerDB[] = [];
    
    await sql`BEGIN`;
    try {
        for (const player of players) {
            const { rows } = await sql<PlayerDB>`
                INSERT INTO players (
                    first_name, 
                    last_name, 
                    skill, 
                    is_defense, 
                    is_attending, 
                    group_code
                )
                VALUES (
                    ${player.first_name}, 
                    ${player.last_name}, 
                    ${player.skill}, 
                    ${player.is_defense},
                    ${player.is_attending},
                    ${groupCode}
                )
                RETURNING *;
            `;
            createdPlayers.push(rows[0]);
        }
        await sql`COMMIT`;
        return createdPlayers;
    } catch (error) {
        await sql`ROLLBACK`;
        throw error;
    }
}

export async function deleteGroup(groupCode: string): Promise<void> {
    const client = await sql.connect();
    try {
        await client.query('BEGIN');
        // Note: The 'attendance' table has 'ON DELETE CASCADE' for player_id and event_id.
        // Deleting players and events will automatically cascade to delete attendance records.
        await client.query('DELETE FROM events WHERE group_code = $1', [groupCode]);
        await client.query('DELETE FROM players WHERE group_code = $1', [groupCode]);
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in deleteGroup transaction:', error);
        throw error;
    } finally {
        client.release();
    }
}

export async function renameGroup(oldGroupCode: string, newGroupCode: string): Promise<void> {
    const client = await sql.connect();
    try {
        await client.query('BEGIN');

        // Check if the new group code already exists to prevent conflicts
        const { rows } = await client.query('SELECT 1 FROM players WHERE group_code = $1 LIMIT 1', [newGroupCode]);
        if (rows.length > 0) {
            throw new Error(`Group code "${newGroupCode}" is already in use.`);
        }

        await client.query('UPDATE players SET group_code = $1 WHERE group_code = $2', [newGroupCode, oldGroupCode]);
        await client.query('UPDATE events SET group_code = $1 WHERE group_code = $2', [newGroupCode, oldGroupCode]);
        
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in renameGroup transaction:', error);
        throw error;
    } finally {
        client.release();
    }
}

// EVENT-RELATED FUNCTIONS

/**
 * Creates a new event for a group.
 */
export async function createEvent(event: EventInput): Promise<EventDB> {
    const { rows } = await sql<EventDB>`
        INSERT INTO events (name, description, event_date, event_time, location, group_code, is_active)
        VALUES (${event.name}, ${event.description}, ${event.event_date}, ${event.event_time}, ${event.location}, ${event.group_code}, ${event.is_active || true})
        RETURNING *;
    `;
    const newEvent = rows[0];
    
    // Create attendance records for all active players in the group
    await createAttendanceRecordsForEvent(newEvent.id, newEvent.group_code);
    
    return newEvent;
}

/**
 * Retrieves all events for a group.
 */
export async function getEventsByGroup(groupCode: string): Promise<EventWithStats[]> {
    const { rows } = await sql<EventWithStats>`
        SELECT 
            e.*,
            COUNT(a.id) FILTER (WHERE a.is_attending = true) AS attending_count,
            COUNT(p.id) AS total_players,
            (COUNT(a.id) FILTER (WHERE a.is_attending = true) * 100.0 / NULLIF(COUNT(p.id), 0)) AS attendance_rate,
            COUNT(CASE WHEN p.is_defense = false AND a.is_attending = true THEN 1 END) as forwards_count,
            COUNT(CASE WHEN p.is_defense = true AND a.is_attending = true THEN 1 END) as defensemen_count
        FROM events e
        LEFT JOIN players p ON e.group_code = p.group_code AND p.is_active = true
        LEFT JOIN attendance a ON e.id = a.event_id AND p.id = a.player_id
        WHERE e.group_code = ${groupCode} AND e.is_active = true
        GROUP BY e.id
        ORDER BY e.event_date DESC, e.event_time DESC;
    `;
    return rows;
}

/**
 * Retrieves an event by its ID.
 */
export async function getEventById(eventId: number): Promise<EventDB | null> {
    const { rows } = await sql<EventDB>`
        SELECT * FROM events 
        WHERE id = ${eventId} AND is_active = true
    `;
    return rows[0] || null;
}

/**
 * Updates an event.
 */
export async function updateEvent(eventId: number, event: Partial<EventInput>): Promise<EventDB> {
    // Dynamically build the SET clause
    const fields = Object.keys(event) as (keyof typeof event)[];
    const values = Object.values(event);
    
    const setClause = fields
        .map((field, i) => `${field} = $${i + 2}`)
        .join(', ');

    const { rows } = await sql<EventDB>`
        UPDATE events 
        SET ${sql.raw(setClause)}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND is_active = true
        RETURNING *;
    `.execute([eventId, ...values]);

    return rows[0];
}

/**
 * Deletes an event.
 */
export async function deleteEvent(eventId: number): Promise<boolean> {
    const { rowCount } = await sql`
        UPDATE events 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${eventId};
    `;
    return rowCount > 0;
}

async function createAttendanceRecordsForEvent(eventId: number, groupCode: string): Promise<void> {
    // Try to get the most recent event's attendance as defaults
    const { rows: lastEventAttendance } = await sql`
        WITH last_event AS (
            SELECT id 
            FROM events
            WHERE group_code = ${groupCode}
              AND id != ${eventId}
              AND event_date < (SELECT event_date FROM events WHERE id = ${eventId})
            ORDER BY event_date DESC, event_time DESC
            LIMIT 1
        )
        SELECT player_id, is_attending 
        FROM attendance
        WHERE event_id = (SELECT id FROM last_event);
    `;

    const attendanceMap = new Map(lastEventAttendance.map((a: { player_id: number, is_attending: boolean }) => [a.player_id, a.is_attending]));

    // Insert attendance records, using previous event's attendance as default, or false if no previous data
    await sql`
        INSERT INTO attendance (player_id, event_id, is_attending)
        SELECT 
            p.id,
            ${eventId},
            COALESCE(la.is_attending, false)
        FROM players p
        LEFT JOIN (
             SELECT player_id, is_attending
             FROM attendance
             WHERE event_id = (
                 SELECT id 
                 FROM events
                 WHERE group_code = ${groupCode}
                   AND id != ${eventId}
                   AND event_date < (SELECT event_date FROM events WHERE id = ${eventId})
                 ORDER BY event_date DESC, event_time DESC
                 LIMIT 1
             )
        ) la ON p.id = la.player_id
        WHERE p.group_code = ${groupCode} AND p.is_active = true
        ON CONFLICT (player_id, event_id) DO NOTHING;
    `;
}

export async function getAttendanceForEvent(eventId: number): Promise<PlayerWithAttendance[]> {
    const { rows } = await sql<PlayerWithAttendance>`
        SELECT 
            p.*,
            a.is_attending AS is_attending_event,
            a.notes
        FROM players p
        LEFT JOIN attendance a ON p.id = a.player_id
        WHERE a.event_id = ${eventId}
          AND p.is_active = true
        ORDER BY p.first_name, p.last_name;
    `;
    return rows;
}

export async function updateAttendance(attendanceData: AttendanceInput[]): Promise<void> {
    // Use transaction for bulk updates
    await sql`BEGIN`;
    try {
        for (const attendance of attendanceData) {
            await sql`
                INSERT INTO attendance (player_id, event_id, is_attending, notes)
                VALUES (${attendance.player_id}, ${attendance.event_id}, ${attendance.is_attending}, ${attendance.notes})
                ON CONFLICT (player_id, event_id) 
                DO UPDATE SET 
                    is_attending = EXCLUDED.is_attending, 
                    notes = EXCLUDED.notes,
                    response_date = CURRENT_TIMESTAMP
            `;
        }
        await sql`COMMIT`;
    } catch (error) {
        await sql`ROLLBACK`;
        throw error;
    }
}

export async function updateSingleAttendance(playerId: number, eventId: number, isAttending: boolean, notes?: string): Promise<AttendanceDB> {
    const { rows } = await sql<AttendanceDB>`
        INSERT INTO attendance (player_id, event_id, is_attending, notes)
        VALUES (${playerId}, ${eventId}, ${isAttending}, ${notes})
        ON CONFLICT (player_id, event_id)
        DO UPDATE SET is_attending = ${isAttending}, notes = ${notes}, response_date = CURRENT_TIMESTAMP
        RETURNING *;
    `;
    return rows[0];
}

export async function getAttendingPlayersForEvent(eventId: number): Promise<PlayerDB[]> {
    const { rows } = await sql<PlayerDB>`
        SELECT p.*
        FROM players p
        JOIN attendance a ON p.id = a.player_id
        WHERE a.event_id = ${eventId} AND a.is_attending = true AND p.is_active = true
        ORDER BY p.is_defense, p.skill DESC;
    `;
    return rows;
} 