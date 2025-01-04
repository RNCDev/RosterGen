import { sql } from '@vercel/postgres';
import { type PlayerDB, type PlayerInput } from '@/types/PlayerTypes';

export async function getPlayers(groupCode: string): Promise<PlayerDB[]> {
    const { rows } = await sql<PlayerDB>`
        SELECT * FROM players 
        WHERE group_code = ${groupCode}
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
            group_code
        ) VALUES (
            ${player.first_name}, 
            ${player.last_name}, 
            ${player.skill}, 
            ${player.is_defense}, 
            ${player.is_attending}, 
            ${player.group_code}
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
        DELETE FROM players 
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
                    group_code
                ) VALUES (
                    ${player.first_name}, 
                    ${player.last_name}, 
                    ${player.skill}, 
                    ${player.is_defense}, 
                    ${player.is_attending}, 
                    ${groupCode}
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
        DELETE FROM players 
        WHERE group_code = ${groupCode}
        RETURNING id
    `;
    return rowCount;
}