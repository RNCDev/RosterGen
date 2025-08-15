import { sql } from '@vercel/postgres';
import { 
    type Group,
    type PlayerDB, 
    type PlayerInput,
    type EventDB,
    type EventInput,
    type EventWithStats,
    type AttendanceDB,
    type AttendanceInput,
    type PlayerWithAttendance
} from '@/types/PlayerTypes';

// ===== GROUP OPERATIONS =====

export async function getGroupById(groupId: number): Promise<Group | null> {
    const { rows } = await sql<Group>`SELECT id, code, created_at, "team-alias-1", "team-alias-2", teamsnap_team_id FROM groups WHERE id = ${groupId}`;
    return rows[0] || null;
}

export async function getGroupByCode(groupCode: string): Promise<Group | null> {
    const { rows } = await sql<Group>`SELECT id, code, created_at, "team-alias-1", "team-alias-2", teamsnap_team_id FROM groups WHERE code = ${groupCode}`;
    return rows[0] || null;
}

export async function createGroup(groupCode: string): Promise<Group> {
    const { rows } = await sql<Group>`
        INSERT INTO groups (code, "team-alias-1", "team-alias-2") 
        VALUES (${groupCode}, 'Red', 'White') 
        RETURNING *
    `;
    return rows[0];
}

export async function renameGroup(groupId: number, newCode: string): Promise<Group> {
    const { rows } = await sql<Group>`
        UPDATE groups 
        SET 
            code = ${newCode}
        WHERE id = ${groupId}
        RETURNING *
    `;
    return rows[0];
}

export async function updateGroupTeamAliases(groupId: number, teamAlias1: string, teamAlias2: string): Promise<Group> {
    const { rows } = await sql<Group>`
        UPDATE groups 
        SET 
            "team-alias-1" = ${teamAlias1},
            "team-alias-2" = ${teamAlias2}
        WHERE id = ${groupId}
        RETURNING *
    `;
    return rows[0];
}

export async function deleteGroup(groupId: number): Promise<boolean> {
    // ON DELETE CASCADE in players and events table will handle cleanup
    const { rowCount } = await sql`DELETE FROM groups WHERE id = ${groupId}`;
    return rowCount > 0;
}

// ===== PLAYER OPERATIONS =====

export async function getPlayersByGroup(groupId: number): Promise<PlayerDB[]> {
    const { rows } = await sql<PlayerDB>`
        SELECT * FROM players 
        WHERE group_id = ${groupId} AND is_active = true
        ORDER BY first_name, last_name
    `;
    return rows;
}

export async function createPlayer(player: PlayerInput): Promise<PlayerDB> {
    const client = await sql.connect();
    try {
        await client.query('BEGIN');
        
        // Create the player
        const { rows: playerRows } = await client.query(
            `INSERT INTO players (first_name, last_name, skill, is_defense, group_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [player.first_name, player.last_name, player.skill, player.is_defense, player.group_id]
        );
        
        const newPlayer = playerRows[0];
        
        // Get all future events for this group (events with date >= today)
        const { rows: futureEvents } = await client.query(
            `SELECT id FROM events 
             WHERE group_id = $1 
             AND is_active = true 
             AND event_date >= CURRENT_DATE
             ORDER BY event_date ASC`,
            [player.group_id]
        );
        
        // Create attendance records for all future events
        for (const event of futureEvents) {
            await client.query(
                `INSERT INTO attendance (player_id, event_id, is_attending)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (player_id, event_id) DO NOTHING`,
                [newPlayer.id, event.id, false] // Default to not attending
            );
        }
        
        await client.query('COMMIT');
        return newPlayer;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating player with attendance records:', error);
        throw error;
    } finally {
        client.release();
    }
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

export async function deletePlayer(playerId: number): Promise<boolean> {
    const { rowCount } = await sql`
        UPDATE players 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${playerId};
    `;
    return rowCount > 0;
}

export async function bulkInsertPlayers(groupId: number, players: Omit<PlayerInput, 'group_id'>[]): Promise<PlayerDB[]> {
    const client = await sql.connect();
    try {
        await client.query('BEGIN');
        
        // Get all future events for this group first
        const { rows: futureEvents } = await client.query(
            `SELECT id FROM events 
             WHERE group_id = $1 
             AND is_active = true 
             AND event_date >= CURRENT_DATE
             ORDER BY event_date ASC`,
            [groupId]
        );
        
        const insertedPlayers: PlayerDB[] = [];
        for (const player of players) {
            const { rows } = await client.query(
                `INSERT INTO players (first_name, last_name, skill, is_defense, group_id)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [player.first_name, player.last_name, player.skill, player.is_defense, groupId]
            );
            const newPlayer = rows[0];
            insertedPlayers.push(newPlayer);
            
            // Create attendance records for all future events for this player
            for (const event of futureEvents) {
                await client.query(
                    `INSERT INTO attendance (player_id, event_id, is_attending)
                     VALUES ($1, $2, $3)
                     ON CONFLICT (player_id, event_id) DO NOTHING`,
                    [newPlayer.id, event.id, false] // Default to not attending
                );
            }
        }
        
        await client.query('COMMIT');
        return insertedPlayers;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in bulk player insert transaction:', error);
        throw error;
    } finally {
        client.release();
    }
}

export async function bulkUpdatePlayers(
    groupId: number,
    playersToCreate: Omit<PlayerInput, 'group_id'>[],
    playersToUpdate: PlayerDB[],
    playersToDelete: number[]
): Promise<void> {
    const client = await sql.connect();
    try {
        await client.query('BEGIN');

        // Delete players
        if (playersToDelete.length > 0) {
            await client.query(
                `UPDATE players SET is_active = false WHERE id = ANY($1::int[]) AND group_id = $2`,
                [playersToDelete, groupId]
            );
        }

        // Update players
        if (playersToUpdate.length > 0) {
            for (const player of playersToUpdate) {
                await client.query(
                    `UPDATE players SET 
                        first_name = $1, 
                        last_name = $2, 
                        skill = $3, 
                        is_defense = $4, 
                        updated_at = CURRENT_TIMESTAMP
                     WHERE id = $5 AND group_id = $6`,
                    [player.first_name, player.last_name, player.skill, player.is_defense, player.id, groupId]
                );
            }
        }

        // Create new players
        if (playersToCreate.length > 0) {
            // Get all future events for this group first
            const { rows: futureEvents } = await client.query(
                `SELECT id FROM events 
                 WHERE group_id = $1 
                 AND is_active = true 
                 AND event_date >= CURRENT_DATE
                 ORDER BY event_date ASC`,
                [groupId]
            );

            for (const player of playersToCreate) {
                const { rows } = await client.query(
                    `INSERT INTO players (first_name, last_name, skill, is_defense, group_id)
                     VALUES ($1, $2, $3, $4, $5)
                     RETURNING *`,
                    [player.first_name, player.last_name, player.skill, player.is_defense, groupId]
                );
                const newPlayer = rows[0];
                
                // Create attendance records for all future events for this player
                for (const event of futureEvents) {
                    await client.query(
                        `INSERT INTO attendance (player_id, event_id, is_attending)
                         VALUES ($1, $2, $3)
                         ON CONFLICT (player_id, event_id) DO NOTHING`,
                        [newPlayer.id, event.id, false] // Default to not attending
                    );
                }
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

// ===== EVENT OPERATIONS =====

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

export async function getEventById(eventId: number): Promise<EventDB | null> {
    const { rows } = await sql<EventDB>`
        SELECT * FROM events 
        WHERE id = ${eventId} AND is_active = true
    `;
    return rows[0] || null;
}

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

export async function deleteEvent(eventId: number): Promise<boolean> {
    const { rowCount } = await sql`
        UPDATE events 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${eventId}
    `;
    return rowCount > 0;
}

export async function updateEventSavedTeams(eventId: number, teamsData: string): Promise<EventDB> {
    const { rows } = await sql<EventDB>`
        UPDATE events 
        SET 
            saved_teams_data = ${teamsData},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${eventId}
        RETURNING *
    `;
    return rows[0];
}

async function createAttendanceRecordsForEvent(eventId: number, groupId: number): Promise<void> {
    // Try to get the most recent event's attendance as defaults
    const { rows: lastEventAttendance } = await sql`
        WITH last_event AS (
            SELECT id 
            FROM events
            WHERE group_id = ${groupId}
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

    // Get all active players in the group
    const { rows: activePlayers } = await sql<{id: number}[]>`
        SELECT id FROM players WHERE group_id = ${groupId} AND is_active = true;
    `;

    if (activePlayers.length === 0) {
        return; // No players, nothing to do
    }

    // Use a transaction to insert all attendance records
    const client = await sql.connect();
    try {
        await client.query('BEGIN');
        for (const player of activePlayers) {
            const isAttending = attendanceMap.get(player.id) ?? true;
            await client.query(
                `INSERT INTO attendance (player_id, event_id, is_attending)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (player_id, event_id) DO NOTHING;`,
                [player.id, eventId, isAttending]
            );
        }
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating attendance records:', error);
        throw error;
    } finally {
        client.release();
    }
}

// ===== ATTENDANCE OPERATIONS =====

export async function getAttendanceForEvent(eventId: number): Promise<PlayerWithAttendance[]> {
    const { rows } = await sql<PlayerWithAttendance>`
        SELECT 
            p.*,
            a.is_attending AS is_attending_event,
            a.notes
        FROM players p
        LEFT JOIN attendance a ON p.id = a.player_id
        WHERE a.event_id = ${eventId} AND p.is_active = true
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
        console.error('Error in updateAttendance transaction:', error);
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

export async function duplicateEvent(eventId: number, newEventData: EventInput): Promise<EventDB> {
    const client = await sql.connect();
    try {
        await client.query('BEGIN');
        
        // Create the new event
        const { rows: eventRows } = await client.query(
            `INSERT INTO events (name, description, event_date, event_time, location, group_id, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                newEventData.name,
                newEventData.description,
                newEventData.event_date,
                newEventData.event_time,
                newEventData.location,
                newEventData.group_id,
                true
            ]
        );
        
        const newEvent = eventRows[0];
        
        // Get attendance patterns from the original event
        const { rows: originalAttendance } = await client.query(
            `SELECT player_id, is_attending 
             FROM attendance 
             WHERE event_id = $1`,
            [eventId]
        );
        
        // Create attendance records for the new event using the original patterns
        for (const attendance of originalAttendance) {
            await client.query(
                `INSERT INTO attendance (player_id, event_id, is_attending)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (player_id, event_id) DO NOTHING`,
                [attendance.player_id, newEvent.id, attendance.is_attending]
            );
        }
        
        await client.query('COMMIT');
        return newEvent;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error duplicating event:', error);
        throw error;
    } finally {
        client.release();
    }
}