import { NextRequest } from 'next/server';
import { z } from 'zod';
import { 
    getAttendanceForEvent,
    updateAttendance,
    updateSingleAttendance
} from '@/lib/db';
import { type AttendanceInput } from '@/types/PlayerTypes';
import {
    ApiResponse,
    withErrorHandler,
    parseId
} from '@/lib/api-utils';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const attendanceInputSchema = z.object({
    player_id: z.number().int().positive(),
    event_id: z.number().int().positive(),
    is_attending: z.boolean(),
    notes: z.string().optional()
});

const bulkAttendanceSchema = z.array(attendanceInputSchema);

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * GET /api/attendance?eventId=...
 * Fetches attendance data for a specific event.
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const eventIdParam = searchParams.get('eventId');

    if (!eventIdParam) {
        return ApiResponse.badRequest('eventId parameter is required');
    }

    const eventId = parseId(eventIdParam, 'Event ID');
    const attendance = await getAttendanceForEvent(eventId);
    
    return ApiResponse.success(attendance);
});

/**
 * POST /api/attendance?bulk=true (bulk updates)
 * POST /api/attendance (single update)
 * Updates attendance records.
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const bulk = searchParams.get('bulk');
    const body = await request.json();

    if (bulk === 'true') {
        // Bulk update multiple attendance records
        const validation = bulkAttendanceSchema.safeParse(body);
        
        if (!validation.success) {
            return ApiResponse.badRequest(
                'Invalid bulk attendance data', 
                validation.error.flatten()
            );
        }

        await updateAttendance(validation.data);
        return ApiResponse.success({ 
            message: 'Attendance updated successfully',
            updated_count: validation.data.length
        });

    } else {
        // Single attendance update
        const validation = attendanceInputSchema.safeParse(body);
        
        if (!validation.success) {
            return ApiResponse.badRequest(
                'Invalid attendance data',
                validation.error.flatten()
            );
        }

        const { player_id, event_id, is_attending, notes } = validation.data;
        const updatedAttendance = await updateSingleAttendance(player_id, event_id, is_attending, notes);
        
        return ApiResponse.success(updatedAttendance);
    }
}); 