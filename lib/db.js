// lib/db.js
import { sql } from '@vercel/postgres';

export async function getAllPlayers() {
  const { rows } = await sql`SELECT * FROM players ORDER BY last_name, first_name`;
  return rows;
}

export async function addPlayer({ firstName, lastName, skill, defense, attending }) {
  const { rows } = await sql`
    INSERT INTO players (first_name, last_name, skill, is_defense, is_attending)
    VALUES (${firstName}, ${lastName}, ${skill}, ${defense}, ${attending})
    RETURNING *
  `;
  return rows[0];
}

export async function updatePlayer(id, { firstName, lastName, skill, defense, attending }) {
  const { rows } = await sql`
    UPDATE players 
    SET first_name = ${firstName},
        last_name = ${lastName},
        skill = ${skill},
        is_defense = ${defense},
        is_attending = ${attending}
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0];
}

export async function saveTeamAssignments(redTeam, whiteTeam, sessionDate) {
  // Start a transaction
  await sql`BEGIN`;
  
  try {
    // Create team entries
    const [redTeamRow] = await sql`
      INSERT INTO teams (name) VALUES ('Red')
      RETURNING id
    `;
    
    const [whiteTeamRow] = await sql`
      INSERT INTO teams (name) VALUES ('White')
      RETURNING id
    `;

    // Save red team assignments
    for (const player of [...redTeam.forwards, ...redTeam.defensemen]) {
      await sql`
        INSERT INTO player_team_assignments (player_id, team_id, session_date)
        VALUES (${player.id}, ${redTeamRow.id}, ${sessionDate})
      `;
    }

    // Save white team assignments
    for (const player of [...whiteTeam.forwards, ...whiteTeam.defensemen]) {
      await sql`
        INSERT INTO player_team_assignments (player_id, team_id, session_date)
        VALUES (${player.id}, ${whiteTeamRow.id}, ${sessionDate})
      `;
    }

    await sql`COMMIT`;
    return true;
  } catch (error) {
    await sql`ROLLBACK`;
    throw error;
  }
}
