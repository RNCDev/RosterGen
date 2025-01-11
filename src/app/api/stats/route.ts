import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
    try {
        // Get count of unique groups
        const groupsResult = await sql`
            SELECT COUNT(DISTINCT group_code) as unique_groups 
            FROM players 
            WHERE group_code != 'default'
        `;

        // Get total player count
        const playersResult = await sql`
            SELECT COUNT(*) as total_players 
            FROM players 
            WHERE group_code != 'default'
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