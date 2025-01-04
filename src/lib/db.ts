import { sql } from '@vercel/postgres';
import { PlayerDB, PlayerInput, toDatabase } from '@/types/PlayerTypes';

export interface DbPlayer {
    id: number;
    first_name: string;
    last_name: string;
    skill: number;
    is_defense: boolean;
    is_attending: boolean;
    group_code: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface PlayerInput {
    first_name: string;
    last_name: string;
    skill: number;
    is_defense: boolean;
    is_attending: boolean;
    group_code: string;
}

export async function getPlayers(groupCode: string): Promise<DbPlayer[]> {
    const { rows } = await sql<DbPlayer>`
        SELECT * FROM players 
        WHERE group_code = ${groupCode}
        ORDER BY last_name, first_name
    `;
    return rows;
}

export async function createPlayer(player: PlayerInput): Promise<PlayerDB> {
    const dbData = toDatabase(player);
    const { rows } = await sql<PlayerDB>`
        INSERT INTO players (
            first_name, 
            last_name, 
            skill, 
            is_defense, 
            is_attending, 
            group_code
        ) VALUES (
            ${dbData.first_name}, 
            ${dbData.last_name}, 
            ${dbData.skill}, 
            ${dbData.is_defense}, 
            ${dbData.is_attending}, 
            ${dbData.group_code}
        )
        RETURNING *
    `;
    return rows[0];
}

export async function updatePlayer(player: DbPlayer): Promise<DbPlayer> {
    const { rows } = await sql<DbPlayer>`
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

export async function createGroup(groupCode: string, players: PlayerInput[]): Promise<DbPlayer[]> {
    const createdPlayers: DbPlayer[] = [];
    
    await sql`BEGIN`;
    try {
        for (const player of players) {
            const { rows } = await sql<DbPlayer>`
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