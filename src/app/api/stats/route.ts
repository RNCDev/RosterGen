import { sql } from '@vercel/postgres';
import {
    ApiResponse,
    withErrorHandler
} from '@/lib/api-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/stats
 * Fetches application statistics including group and player counts.
 */
export const GET = withErrorHandler(async () => {
    // Get count of unique groups (excluding default)
    const groupsResult = await sql`
        SELECT COUNT(*) as unique_groups 
        FROM groups 
        WHERE code != 'default'
    `;

    // Get total player count (excluding default group players)
    const playersResult = await sql`
        SELECT COUNT(players.id) as total_players 
        FROM players
        JOIN groups ON players.group_id = groups.id
        WHERE groups.code != 'default'
    `;

    return ApiResponse.success({
        uniqueGroups: parseInt(groupsResult.rows[0].unique_groups),
        totalPlayers: parseInt(playersResult.rows[0].total_players)
    });
}); 