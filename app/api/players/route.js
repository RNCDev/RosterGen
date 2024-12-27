// app/api/players/route.js
import { NextResponse } from 'next/server';
import { getAllPlayers, addPlayer, updatePlayer } from '../../../lib/db';

export async function GET() {
  try {
    const players = await getAllPlayers();
    return NextResponse.json(players);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const player = await addPlayer(data);
    return NextResponse.json(player);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, ...data } = await request.json();
    const player = await updatePlayer(id, data);
    return NextResponse.json(player);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
