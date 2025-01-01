import { sql } from '@vercel/postgres';

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

export interface DbTeam {
    id: number;
    name: string;
    group_code: string;
    created_at?: Date;
}

export interface DbPlayerTeamAssignment {
    id: number;
    player_id: number;
    team_id: number;
    session_date: Date;
    created_at?: Date;
}

export interface PlayerInput {
    firstName: string;
    lastName: string;
    skill: number;
    defense: boolean;
    attending: boolean;
    groupCode: string;
}

export interface TeamAssignment {
    forwards: DbPlayer[];
    defensemen: DbPlayer[];
}

export async function getAllPlayers(groupCode: string): Promise<DbPlayer[]> {
    try {
        const { rows } = await sql<DbPlayer>`
            SELECT * FROM players 
            WHERE group_code = ${groupCode}
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
        const { firstName, lastName, skill, defense, attending, groupCode } = input;
        const { rows } = await sql<DbPlayer>`
            INSERT INTO players (
                first_name, 
                last_name, 
                skill, 
                is_defense, 
                is_attending,
                group_code
            )
            VALUES (
                ${firstName}, 
                ${lastName}, 
                ${skill}, 
                ${defense}, 
                ${attending},
                ${groupCode}
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
        const { firstName, lastName, skill, defense, attending, groupCode } = input;

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
                is_attending = ${attending},
                group_code = ${groupCode}
            WHERE id = ${id}
            AND group_code = ${groupCode}
            RETURNING *
        `;

        if (rows.length === 0) {
            throw new Error('Player not found');
        }

        return rows[0];
    } catch (error) {
        console.error('Database error in updatePlayer:', error);
        if (error instanceof Error && error.message.includes('players_skill_check')) {
            throw new Error('Skill must be between 1 and 10');
        }
        throw new Error('Failed to update player');
    }
}

export async function deletePlayer(id: number, groupCode: string): Promise<boolean> {
    try {
        const result = await sql`
            DELETE FROM players 
            WHERE id = ${id} 
            AND group_code = ${groupCode}
        `;
        return result.rowCount > 0;
    } catch (error) {
        console.error('Error deleting player:', error);
        throw new Error('Failed to delete player');
    }
}

export async function deleteGroup(groupCode: string): Promise<boolean> {
    try {
        // Start a transaction
        await sql`BEGIN`;

        try {
            // First, get all team IDs for this group
            const { rows: teams } = await sql<{ id: number }>`
                SELECT id FROM teams WHERE group_code = ${groupCode}
            `;

            // Delete player_team_assignments first (due to foreign key)
            if (teams.length > 0) {
                const teamIds = teams.map((team: { id: number }) => team.id);
                const { rowCount: assignmentsDeleted } = await sql`
                    DELETE FROM player_team_assignments
                    WHERE team_id = ANY(${teamIds}::int[])
                `;
                console.log('Deleted assignments count:', assignmentsDeleted);
            }

            // Delete teams
            const { rowCount: teamsDeleted } = await sql`
                DELETE FROM teams 
                WHERE group_code = ${groupCode}
                RETURNING id
            `;
            console.log('Deleted teams count:', teamsDeleted);

            // Delete players
            const { rowCount: playersDeleted } = await sql`
                DELETE FROM players 
                WHERE group_code = ${groupCode}
                RETURNING id
            `;
            console.log('Deleted players count:', playersDeleted);

            await sql`COMMIT`;
            return true;
        } catch (error) {
            await sql`ROLLBACK`;
            throw error;
        }
    } catch (error) {
        console.error('Database error in deleteGroup:', error);
        throw new Error('Failed to delete group');
    }
}

export async function saveTeamAssignments(
    redTeam: TeamAssignment,
    whiteTeam: TeamAssignment,
    sessionDate: Date,
    groupCode: string
): Promise<boolean> {
    try {
        await sql`BEGIN`;
        try {
            const { rows: [redTeamRow] } = await sql<DbTeam>`
                INSERT INTO teams (name, group_code) 
                VALUES ('Red', ${groupCode})
                RETURNING id
            `;

            const { rows: [whiteTeamRow] } = await sql<DbTeam>`
                INSERT INTO teams (name, group_code) 
                VALUES ('White', ${groupCode})
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