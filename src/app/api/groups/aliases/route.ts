import { NextRequest, NextResponse } from 'next/server';
import { updateGroupTeamAliases } from '@/lib/db';

export async function PUT(req: NextRequest) {
    try {
        const { groupId, teamAlias1, teamAlias2 } = await req.json();

        if (!groupId || !teamAlias1 || !teamAlias2) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const updatedGroup = await updateGroupTeamAliases(groupId, teamAlias1, teamAlias2);

        if (!updatedGroup) {
            return NextResponse.json({ error: 'Group not found or update failed' }, { status: 404 });
        }

        return NextResponse.json(updatedGroup);
    } catch (error) {
        console.error('Error updating group team aliases:', error);
        return NextResponse.json({ error: 'Failed to update team aliases' }, { status: 500 });
    }
} 