import { sql } from '@vercel/postgres';

// Database row types - export these for use in other files
export interface DbPlayer {
    id: number;
    first_name: string;
    last_name: string;
    skill: number;
    is_defense: boolean;
    is_attending: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export interface DbTeam {
    id: number;
    name: string;
    created_at?: Date;
}

export interface DbPlayerTeamAssignment {
    id: number;
    player_id: number;
    team_id: number;
    session_date: Date;
    created_at?: Date;
}

// Input types for function parameters
export interface PlayerInput {
    firstName: string;
    lastName: string;
    skill: number;
    defense: boolean;
    attending: boolean;
}

export interface TeamAssignment {
    forwards: DbPlayer[];
    defensemen: DbPlayer[];
}

export async function getAllPlayers(): Promise<DbPlayer[]> {
    try {
        const { rows } = await sql<DbPlayer>`
            SELECT * FROM players 
            ORDER BY last_name, first_name
        `;
        return rows;
    } catch (error) {
        console.error('Database error in getAllPlayers:', error);
        throw new Error('Failed to fetch players');
    }
}

export async function addPlayer(input: PlayerInput): Promise<DbPlayer> {
    try {
        const { firstName, lastName, skill, defense, attending } = input;
        const { rows } = await sql<DbPlayer>`
            INSERT INTO players (
                first_name, 
                last_name, 
                skill, 
                is_defense, 
                is_attending
            )
            VALUES (
                ${firstName}, 
                ${lastName}, 
                ${skill}, 
                ${defense}, 
                ${attending}
            )
            RETURNING *
        `;

        if (rows.length === 0) {
            throw new Error('Failed to insert player');
        }

        return rows[0];
    } catch (error) {
        console.error('Database error in addPlayer:', error);
        throw new Error('Failed to add player');
    }
}

export async function updatePlayer(
    id: number,
    input: PlayerInput
): Promise<DbPlayer> {
    try {
        const { firstName, lastName, skill, defense, attending } = input;

        // Validate skill is within constraints
        if (skill < 1 || skill > 10) {
            throw new Error('Skill must be between 1 and 10');
        }

        const { rows } = await sql<DbPlayer>`
            UPDATE players
            SET first_name = ${firstName},
                last_name = ${lastName},
                skill = ${skill},
                is_defense = ${defense},
                is_attending = ${attending}
            WHERE id = ${id}
            RETURNING *
        `;

        if (rows.length === 0) {
            throw new Error('Player not found');
        }

        return rows[0];
    } catch (error) {
        console.error('Database error in updatePlayer:', error);
        console.error('Query parameters:', { id, ...input });

        // Enhanced error handling
        if (error instanceof Error) {
            if (error.message.includes('players_skill_check')) {
                throw new Error('Skill must be between 1 and 10');
            }
        }
        throw new Error('Failed to update player');
    }
}

export async function deletePlayer(id: number): Promise<boolean> {
    try {
        const result = await sql`
            DELETE FROM players 
            WHERE id = ${id}
        `;
        return result.rowCount > 0;
    } catch (error) {
        console.error('Error deleting player:', error);
        throw new Error('Failed to delete player');
    }
}

export async function saveTeamAssignments(
    redTeam: TeamAssignment,
    whiteTeam: TeamAssignment,
    sessionDate: Date
): Promise<boolean> {
    try {
        // Start a transaction
        await sql`BEGIN`;

        try {
            // Create team entries
            const { rows: [redTeamRow] } = await sql<DbTeam>`
                INSERT INTO teams (name) 
                VALUES ('Red')
                RETURNING id
            `;

            const { rows: [whiteTeamRow] } = await sql<DbTeam>`
                INSERT INTO teams (name) 
                VALUES ('White')
                RETURNING id
            `;

            // Save red team assignments
            const redTeamPlayers = [...redTeam.forwards, ...redTeam.defensemen];
            for (const player of redTeamPlayers) {
                await sql<DbPlayerTeamAssignment>`
                    INSERT INTO player_team_assignments (
                        player_id, 
                        team_id, 
                        session_date
                    )
                    VALUES (
                        ${player.id}, 
                        ${redTeamRow.id}, 
                        ${sessionDate}
                    )
                `;
            }

            // Save white team assignments
            const whiteTeamPlayers = [...whiteTeam.forwards, ...whiteTeam.defensemen];
            for (const player of whiteTeamPlayers) {
                await sql<DbPlayerTeamAssignment>`
                    INSERT INTO player_team_assignments (
                        player_id, 
                        team_id, 
                        session_date
                    )
                    VALUES (
                        ${player.id}, 
                        ${whiteTeamRow.id}, 
                        ${sessionDate}
                    )
                `;
            }

            await sql`COMMIT`;
            return true;
        } catch (error) {
            await sql`ROLLBACK`;
            throw error;
        }
    } catch (error) {
        console.error('Database error in saveTeamAssignments:', error);
        throw new Error('Failed to save team assignments');
    }
}