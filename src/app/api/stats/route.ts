import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
    try {
        // Get count of unique groups
        const groupsResult = await sql`
            SELECT COUNT(*) as unique_groups 
            FROM groups 
            WHERE code != 'default'
        `;

        // Get total player count
        const playersResult = await sql`
            SELECT COUNT(players.id) as total_players 
            FROM players
            JOIN groups ON players.group_id = groups.id
            WHERE groups.code != 'default'
        `;

        return NextResponse.json({
            uniqueGroups: groupsResult.rows[0].unique_groups,
            totalPlayers: playersResult.rows[0].total_players
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
} 