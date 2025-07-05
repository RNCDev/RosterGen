import { ApiResponse, withErrorHandler, parseId } from '@/lib/api-utils';

describe('API Utils', () => {
    describe('ApiResponse', () => {
        it('creates success response', () => {
            const data = { message: 'test' };
            const response = ApiResponse.success(data);
            
            expect(response.status).toBe(200);
            expect(response.headers.get('content-type')).toBe('application/json');
        });

        it('creates bad request response', () => {
            const message = 'Invalid input';
            const response = ApiResponse.badRequest(message);
            
            expect(response.status).toBe(400);
            expect(response.headers.get('content-type')).toBe('application/json');
        });

        it('creates not found response', () => {
            const message = 'Resource not found';
            const response = ApiResponse.notFound(message);
            
            expect(response.status).toBe(404);
            expect(response.headers.get('content-type')).toBe('application/json');
        });

        it('creates server error response', () => {
            const message = 'Internal server error';
            const response = ApiResponse.serverError(message);
            
            expect(response.status).toBe(500);
            expect(response.headers.get('content-type')).toBe('application/json');
        });
    });

    describe('parseId', () => {
        it('parses valid numeric string', () => {
            expect(parseId('123', 'Test ID')).toBe(123);
            expect(parseId('0', 'Test ID')).toBe(0);
        });

        it('throws error for invalid numeric string', () => {
            expect(() => parseId('abc', 'Test ID')).toThrow('Invalid Test ID: abc');
            expect(() => parseId('12.34', 'Test ID')).toThrow('Invalid Test ID: 12.34');
            expect(() => parseId('-1', 'Test ID')).toThrow('Invalid Test ID: -1');
        });

        it('throws error for empty string', () => {
            expect(() => parseId('', 'Test ID')).toThrow('Invalid Test ID: ');
        });

        it('throws error for null/undefined', () => {
            expect(() => parseId(null as any, 'Test ID')).toThrow('Invalid Test ID: null');
            expect(() => parseId(undefined as any, 'Test ID')).toThrow('Invalid Test ID: undefined');
        });
    });

    describe('withErrorHandler', () => {
        it('returns successful response when handler succeeds', async () => {
            const mockHandler = jest.fn().mockResolvedValue(
                new Response(JSON.stringify({ success: true }), { status: 200 })
            );
            
            const wrappedHandler = withErrorHandler(mockHandler);
            const request = new Request('http://localhost:3000/api/test');
            
            const response = await wrappedHandler(request);
            
            expect(response.status).toBe(200);
            expect(mockHandler).toHaveBeenCalledWith(request);
        });

        it('returns bad request for validation errors', async () => {
            const mockHandler = jest.fn().mockRejectedValue(
                new Error('Validation error')
            );
            
            const wrappedHandler = withErrorHandler(mockHandler);
            const request = new Request('http://localhost:3000/api/test');
            
            const response = await wrappedHandler(request);
            
            expect(response.status).toBe(400);
            const responseData = await response.json();
            expect(responseData.error).toBe('Validation error');
        });

        it('returns not found for missing resources', async () => {
            const mockHandler = jest.fn().mockRejectedValue(
                new Error('Not found')
            );
            
            const wrappedHandler = withErrorHandler(mockHandler);
            const request = new Request('http://localhost:3000/api/test');
            
            const response = await wrappedHandler(request);
            
            expect(response.status).toBe(404);
            const responseData = await response.json();
            expect(responseData.error).toBe('Not found');
        });

        it('returns server error for unexpected errors', async () => {
            const mockHandler = jest.fn().mockRejectedValue(
                new Error('Database connection failed')
            );
            
            const wrappedHandler = withErrorHandler(mockHandler);
            const request = new Request('http://localhost:3000/api/test');
            
            const response = await wrappedHandler(request);
            
            expect(response.status).toBe(500);
            const responseData = await response.json();
            expect(responseData.error).toBe('Database connection failed');
        });

        it('handles non-Error objects', async () => {
            const mockHandler = jest.fn().mockRejectedValue('String error');
            
            const wrappedHandler = withErrorHandler(mockHandler);
            const request = new Request('http://localhost:3000/api/test');
            
            const response = await wrappedHandler(request);
            
            expect(response.status).toBe(500);
            const responseData = await response.json();
            expect(responseData.error).toBe('String error');
        });
    });
}); 