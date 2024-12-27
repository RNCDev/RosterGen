// app/api/teams/route.js
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { redTeam, whiteTeam, sessionDate } = await request.json();

    // First, delete any existing assignments for this session date
    await sql`
      DELETE FROM player_team_assignments 
      WHERE session_date = ${sessionDate}::date;
    `;

    // Insert red team assignments
    for (const player of [...redTeam.forwards, ...redTeam.defensemen]) {
      await sql`
        INSERT INTO player_team_assignments 
        (player_id, team_color, is_defense, session_date)
        VALUES (
          ${player.id},
          'red',
          ${player.is_defense},
          ${sessionDate}::date
        );
      `;
    }

    // Insert white team assignments
    for (const player of [...whiteTeam.forwards, ...whiteTeam.defensemen]) {
      await sql`
        INSERT INTO player_team_assignments 
        (player_id, team_color, is_defense, session_date)
        VALUES (
          ${player.id},
          'white',
          ${player.is_defense},
          ${sessionDate}::date
        );
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Team assignment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    // Get the session date from the URL search params
    const { searchParams } = new URL(request.url);
    const sessionDate = searchParams.get('date');

    if (!sessionDate) {
      return NextResponse.json({ error: 'Session date is required' }, { status: 400 });
    }

    // Get team assignments for the specified date
    const assignments = await sql`
      SELECT 
        pta.team_color,
        pta.is_defense,
        p.id,
        p.first_name,
        p.last_name,
        p.skill
      FROM player_team_assignments pta
      JOIN players p ON p.id = pta.player_id
      WHERE pta.session_date = ${sessionDate}::date
      ORDER BY p.skill DESC;
    `;

    // Format the response
    const teams = {
      red: { forwards: [], defensemen: [] },
      white: { forwards: [], defensemen: [] }
    };

    assignments.rows.forEach(player => {
      const team = teams[player.team_color];
      if (player.is_defense) {
        team.defensemen.push(player);
      } else {
        team.forwards.push(player);
      }
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Team fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
