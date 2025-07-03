import { testPlayers, runBulkAnalysis } from '@/lib/teamGenerator.analysis';
import {
    ApiResponse,
    withErrorHandler
} from '@/lib/api-utils';

/**
 * GET /api/test-generator
 * Runs team generation analysis for testing purposes.
 */
export const GET = withErrorHandler(async () => {
    const analysisResults = runBulkAnalysis(testPlayers, 100);
    return ApiResponse.success(analysisResults);
}); 