// app/api/players/route.js
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { first_name, last_name, skill, is_defense, is_attending } = body;
    
    // Log the incoming data
    console.log('Received player data:', body);

    const result = await sql`
      INSERT INTO players (first_name, last_name, skill, is_defense, is_attending)
      VALUES (${first_name}, ${last_name}, ${skill}, ${is_defense}, ${is_attending})
      RETURNING *;
    `;
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await sql`SELECT * FROM players;`;
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// For handling PUT requests
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, first_name, last_name, skill, is_defense, is_attending } = body;
    
    const result = await sql`
      UPDATE players 
      SET first_name = ${first_name},
          last_name = ${last_name},
          skill = ${skill},
          is_defense = ${is_defense},
          is_attending = ${is_attending}
      WHERE id = ${id}
      RETURNING *;
    `;
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
