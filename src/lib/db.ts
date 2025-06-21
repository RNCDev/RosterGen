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
        ORDER BY last_name, first_name
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
            group_code,
            is_active
        ) VALUES (
            ${player.first_name}, 
            ${player.last_name}, 
            ${player.skill}, 
            ${player.is_defense}, 
            ${player.is_attending}, 
            ${player.group_code},
            true
        )
        RETURNING *
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
        WHERE id = ${player.id} AND group_code = ${player.group_code}
        RETURNING *
    `;
    return rows[0];
}

export async function deletePlayer(id: number, groupCode: string): Promise<boolean> {
    const { rowCount } = await sql`
        UPDATE players 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} AND group_code = ${groupCode}
    `;
    return rowCount > 0;
}

export async function createGroup(groupCode: string, players: PlayerInput[]): Promise<PlayerDB[]> {
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
                    group_code,
                    is_active
                ) VALUES (
                    ${player.first_name}, 
                    ${player.last_name}, 
                    ${player.skill}, 
                    ${player.is_defense}, 
                    ${player.is_attending}, 
                    ${groupCode},
                    true
                )
                RETURNING *
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

export async function deleteGroup(groupCode: string): Promise<number> {
    const { rowCount } = await sql`
        UPDATE players 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE group_code = ${groupCode}
        RETURNING id
    `;
    return rowCount;
}

// ===== EVENT OPERATIONS =====

export async function createEvent(event: EventInput): Promise<EventDB> {
    const { rows } = await sql<EventDB>`
        INSERT INTO events (name, description, event_date, event_time, location, group_code, is_active)
        VALUES (${event.name}, ${event.description}, ${event.event_date}, ${event.event_time}, ${event.location}, ${event.group_code}, ${event.is_active || true})
        RETURNING *
    `;
    
    // Auto-create attendance records for all active players in the group
    await createAttendanceRecordsForEvent(rows[0].id, event.group_code);
    
    return rows[0];
}

export async function getEventsByGroup(groupCode: string): Promise<EventWithStats[]> {
    const { rows } = await sql<EventWithStats>`
        SELECT 
            e.*,
            COUNT(a.id) as total_players,
            COUNT(CASE WHEN a.is_attending = true THEN 1 END) as attending_count,
            COUNT(CASE WHEN a.is_attending = false THEN 1 END) as not_attending_count,
            COUNT(CASE WHEN a.is_attending IS NULL THEN 1 END) as no_response_count,
            ROUND(
                COUNT(CASE WHEN a.is_attending = true THEN 1 END) * 100.0 / NULLIF(COUNT(a.id), 0), 
                1
            ) as attendance_rate
        FROM events e
        LEFT JOIN attendance a ON e.id = a.event_id
        LEFT JOIN players p ON a.player_id = p.id AND p.is_active = true
        WHERE e.group_code = ${groupCode} AND e.is_active = true
        GROUP BY e.id
        ORDER BY e.event_date DESC, e.event_time DESC
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
    const { rows } = await sql<EventDB>`
        UPDATE events 
        SET 
            name = COALESCE(${event.name}, name),
            description = COALESCE(${event.description}, description),
            event_date = COALESCE(${event.event_date}, event_date),
            event_time = COALESCE(${event.event_time}, event_time),
            location = COALESCE(${event.location}, location),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${eventId} AND is_active = true
        RETURNING *
    `;
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

async function createAttendanceRecordsForEvent(eventId: number, groupCode: string): Promise<void> {
    await sql`
        INSERT INTO attendance (player_id, event_id, is_attending)
        SELECT p.id, ${eventId}, false
        FROM players p
        WHERE p.group_code = ${groupCode} AND p.is_active = true
    `;
}

// ===== ATTENDANCE OPERATIONS =====

export async function getAttendanceForEvent(eventId: number): Promise<PlayerWithAttendance[]> {
    const { rows } = await sql<PlayerWithAttendance>`
        SELECT 
            p.*,
            a.id as attendance_id,
            a.is_attending as is_attending_event,
            a.response_date,
            a.notes
        FROM players p
        LEFT JOIN attendance a ON p.id = a.player_id AND a.event_id = ${eventId}
        WHERE p.group_code = (SELECT group_code FROM events WHERE id = ${eventId})
        AND p.is_active = true
        ORDER BY p.first_name, p.last_name
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
        DO UPDATE SET 
            is_attending = EXCLUDED.is_attending,
            notes = EXCLUDED.notes,
            response_date = CURRENT_TIMESTAMP
        RETURNING *
    `;
    return rows[0];
}

export async function getAttendingPlayersForEvent(eventId: number): Promise<PlayerDB[]> {
    const { rows } = await sql<PlayerDB>`
        SELECT p.*
        FROM players p
        INNER JOIN attendance a ON p.id = a.player_id
        WHERE a.event_id = ${eventId} AND a.is_attending = true AND p.is_active = true
        ORDER BY p.first_name, p.last_name
    `;
    
    return rows;
}