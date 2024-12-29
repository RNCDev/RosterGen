// app/api/teams/route.js
import { NextResponse } from 'next/server';
import { saveTeamAssignments } from '../../../lib/db';

export async function POST(request) {
  try {
    const { redTeam, whiteTeam, sessionDate } = await request.json();
    await saveTeamAssignments(redTeam, whiteTeam, sessionDate);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
