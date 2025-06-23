import { sql } from '@vercel/postgres';
import { 
    type PlayerDB, 
    type PlayerInput,
    type EventDB,
    type EventInput,
    type EventWithStats,
    type AttendanceDB,
    type AttendanceInput,
    type PlayerWithAttendance,
    type Group
} from '@/types/PlayerTypes';

export async function getPlayers(groupId: number): Promise<PlayerDB[]> {
    const { rows } = await sql<PlayerDB>`
        SELECT * FROM players 
        WHERE group_id = ${groupId} AND is_active = true
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
            group_id
        )
        VALUES (
            ${player.first_name}, 
            ${player.last_name}, 
            ${player.skill}, 
            ${player.is_defense}, 
            ${player.group_id}
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
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${player.id}
        RETURNING *;
    `;
    return rows[0];
}

export async function deletePlayer(id: number, groupId: number): Promise<boolean> {
    const { rowCount } = await sql`
        UPDATE players 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} AND group_id = ${groupId};
    `;
    return rowCount > 0;
}

export async function bulkUpdatePlayers(
    groupId: number,
    playersToCreate: Omit<PlayerDB, 'id' | 'created_at' | 'updated_at' | 'is_active'>[],
    playersToUpdate: PlayerDB[],
    playersToDelete: number[]
) {
    const client = await sql.connect();
    try {
        await client.query('BEGIN');

        if (playersToDelete.length > 0) {
            await client.query('DELETE FROM players WHERE id = ANY($1::int[]) AND group_id = $2', [playersToDelete, groupId]);
        }

        if (playersToUpdate.length > 0) {
            for (const player of playersToUpdate) {
                await client.query(
                    `UPDATE players SET first_name = $1, last_name = $2, skill = $3, is_defense = $4, updated_at = CURRENT_TIMESTAMP
                     WHERE id = $5 AND group_id = $6`,
                    [player.first_name, player.last_name, player.skill, player.is_defense, player.id, groupId]
                );
            }
        }

        if (playersToCreate.length > 0) {
            for (const player of playersToCreate) {
                await client.query(
                    `INSERT INTO players (first_name, last_name, skill, is_defense, group_id)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [player.first_name, player.last_name, player.skill, player.is_defense, groupId]
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

export async function bulkInsertPlayers(groupId: number, players: PlayerInput[]): Promise<PlayerDB[]> {
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
                    group_id
                )
                VALUES (
                    ${player.first_name}, 
                    ${player.last_name}, 
                    ${player.skill}, 
                    ${player.is_defense},
                    ${groupId}
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

export async function deleteGroup(groupId: number): Promise<boolean> {
    const { rowCount } = await sql`
        DELETE FROM groups WHERE id = ${groupId}
    `;
    return rowCount > 0;
}

export async function renameGroup(groupId: number, newCode: string): Promise<Group> {
    const { rows } = await sql<Group>`
        UPDATE groups SET code = ${newCode}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${groupId}
        RETURNING *;
    `;
    return rows[0];
}

// EVENT-RELATED FUNCTIONS

/**
 * Creates a new event for a group.
 */
export async function createEvent(event: EventInput): Promise<EventDB> {
    const { rows } = await sql<EventDB>`
        INSERT INTO events (name, description, event_date, event_time, location, group_id, is_active)
        VALUES (${event.name}, ${event.description}, ${event.event_date}, ${event.event_time}, ${event.location}, ${event.group_id}, ${event.is_active || true})
        RETURNING *;
    `;
    const newEvent = rows[0];
    
    // Create attendance records for all active players in the group
    await createAttendanceRecordsForEvent(newEvent.id, newEvent.group_id);
    
    return newEvent;
}

/**
 * Retrieves all events for a group.
 */
export async function getEventsByGroup(groupId: number): Promise<EventWithStats[]> {
    const { rows } = await sql<EventWithStats>`
        SELECT 
            e.*,
            COUNT(a.id) FILTER (WHERE a.is_attending = true) AS attending_count,
            COUNT(p.id) AS total_players,
            (COUNT(a.id) FILTER (WHERE a.is_attending = true) * 100.0 / NULLIF(COUNT(p.id), 0)) AS attendance_rate,
            COUNT(CASE WHEN p.is_defense = false AND a.is_attending = true THEN 1 END) as forwards_count,
            COUNT(CASE WHEN p.is_defense = true AND a.is_attending = true THEN 1 END) as defensemen_count
        FROM events e
        LEFT JOIN players p ON e.group_id = p.group_id AND p.is_active = true
        LEFT JOIN attendance a ON e.id = a.event_id AND p.id = a.player_id
        WHERE e.group_id = ${groupId} AND e.is_active = true
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
    
    const setClause = fields.map((field, i) => `"${field}" = $${i + 1}`).join(', ');

    const { rows } = await sql<EventDB>`
        UPDATE events
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${fields.length + 1}
        RETURNING *;
    `;
    // Pass eventId as the last parameter
    const queryParams = [...values, eventId];
    const { rows: updatedRows } = await sql.query(
        `UPDATE events SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *;`,
        queryParams
    );

    return updatedRows[0];
}

/**
 * Deletes an event and its attendance records.
 */
export async function deleteEvent(eventId: number): Promise<boolean> {
    // ON DELETE CASCADE on attendance table will handle child records
    const { rowCount } = await sql`
        DELETE FROM events WHERE id = ${eventId};
    `;
    return rowCount > 0;
}

async function createAttendanceRecordsForEvent(eventId: number, groupId: number): Promise<void> {
    const { rows: players } = await sql<PlayerDB>`
        SELECT id FROM players WHERE group_id = ${groupId} AND is_active = true
    `;

    if (players.length === 0) {
        return;
    }

    const client = await sql.connect();
    try {
        await client.query('BEGIN');

        for (const player of players) {
            await client.query(
                `INSERT INTO attendance (player_id, event_id, is_attending) VALUES ($1, $2, $3)`,
                [player.id, eventId, false] // Default to not attending
            );
        }
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Failed to create attendance records for event ${eventId}:`, error);
        throw error;
    } finally {
        client.release();
    }
}

export async function getAttendanceForEvent(eventId: number): Promise<PlayerWithAttendance[]> {
    const { rows } = await sql<PlayerWithAttendance>`
        SELECT 
            p.*,
            a.is_attending AS is_attending_event,
            a.notes
        FROM players p
        LEFT JOIN attendance a ON p.id = a.player_id AND a.event_id = ${eventId}
        WHERE p.group_id = (SELECT group_id FROM events WHERE id = ${eventId})
          AND p.is_active = true
        ORDER BY p.first_name, p.last_name;
    `;
    return rows;
}

export async function updateAttendance(attendanceData: AttendanceInput[]): Promise<void> {
    const client = await sql.connect();
    try {
        await client.query('BEGIN');
        for (const record of attendanceData) {
            await client.query(
                `INSERT INTO attendance (player_id, event_id, is_attending, notes, response_date)
                 VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
                 ON CONFLICT (player_id, event_id) 
                 DO UPDATE SET 
                    is_attending = EXCLUDED.is_attending,
                    notes = EXCLUDED.notes,
                    response_date = CURRENT_TIMESTAMP;`,
                [record.player_id, record.event_id, record.is_attending, record.notes]
            );
        }
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in bulk attendance update:', error);
        throw error;
    } finally {
        client.release();
    }
}

export async function updateSingleAttendance(playerId: number, eventId: number, isAttending: boolean, notes?: string): Promise<AttendanceDB> {
    const { rows } = await sql<AttendanceDB>`
        INSERT INTO attendance (player_id, event_id, is_attending, notes, response_date)
        VALUES (${playerId}, ${eventId}, ${isAttending}, ${notes}, CURRENT_TIMESTAMP)
        ON CONFLICT (player_id, event_id)
        DO UPDATE SET
            is_attending = EXCLUDED.is_attending,
            notes = EXCLUDED.notes,
            response_date = CURRENT_TIMESTAMP
        RETURNING *;
    `;
    return rows[0];
}

export async function getAttendingPlayersForEvent(eventId: number): Promise<PlayerDB[]> {
    const { rows } = await sql<PlayerDB>`
        SELECT p.*
        FROM players p
        JOIN attendance a ON p.id = a.player_id
        WHERE a.event_id = ${eventId} AND a.is_attending = true AND p.is_active = true;
    `;
    return rows;
}

// GROUP-RELATED FUNCTIONS
export async function getGroupByCode(code: string): Promise<Group | null> {
    const { rows } = await sql<Group>`
        SELECT * FROM groups WHERE code = ${code}
    `;
    return rows[0] || null;
}

export async function createGroup(code: string): Promise<Group> {
    const { rows } = await sql<Group>`
        INSERT INTO groups (code) VALUES (${code}) RETURNING *
    `;
    return rows[0];
} 