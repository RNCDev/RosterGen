import { NextRequest, NextResponse } from 'next/server';
import { 
    getAttendanceForEvent,
    updateAttendance,
    updateSingleAttendance
} from '@/lib/db';
import { type AttendanceInput } from '@/types/PlayerTypes';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');

        if (!eventId) {
            return NextResponse.json(
                { error: 'eventId parameter is required' },
                { status: 400 }
            );
        }

        const attendance = await getAttendanceForEvent(parseInt(eventId));
        return NextResponse.json(attendance);

    } catch (error) {
        console.error('Error fetching attendance:', error);
        return NextResponse.json(
            { error: 'Failed to fetch attendance data' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const bulk = searchParams.get('bulk');

        if (bulk === 'true') {
            // Bulk update multiple attendance records
            const attendanceUpdates: AttendanceInput[] = await request.json();
            
            if (!Array.isArray(attendanceUpdates)) {
                return NextResponse.json(
                    { error: 'Bulk updates must be an array of attendance records' },
                    { status: 400 }
                );
            }

            // Validate each attendance record
            for (const attendance of attendanceUpdates) {
                if (!attendance.player_id || !attendance.event_id || typeof attendance.is_attending !== 'boolean') {
                    return NextResponse.json(
                        { error: 'Each attendance record must have player_id, event_id, and is_attending' },
                        { status: 400 }
                    );
                }
            }

            await updateAttendance(attendanceUpdates);
            return NextResponse.json({ message: 'Attendance updated successfully' });

        } else {
            // Single attendance update
            const { player_id, event_id, is_attending, notes }: AttendanceInput = await request.json();

            if (!player_id || !event_id || typeof is_attending !== 'boolean') {
                return NextResponse.json(
                    { error: 'player_id, event_id, and is_attending are required' },
                    { status: 400 }
                );
            }

            const updatedAttendance = await updateSingleAttendance(player_id, event_id, is_attending, notes);
            return NextResponse.json(updatedAttendance);
        }

    } catch (error) {
        console.error('Error updating attendance:', error);
        return NextResponse.json(
            { error: 'Failed to update attendance' },
            { status: 500 }
        );
    }
} 