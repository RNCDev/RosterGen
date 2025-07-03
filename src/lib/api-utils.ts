import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// =============================================================================
// RESPONSE UTILITIES
// =============================================================================

/**
 * Standardized API response helpers
 */
export const ApiResponse = {
  success: <T>(data: T, status = 200) => {
    return NextResponse.json(data, { status });
  },

  created: <T>(data: T) => {
    return NextResponse.json(data, { status: 201 });
  },

  noContent: () => {
    return new NextResponse(null, { status: 204 });
  },

  badRequest: (message: string, details?: any) => {
    return NextResponse.json(
      { error: message, ...(details && { details }) },
      { status: 400 }
    );
  },

  notFound: (message = 'Resource not found') => {
    return NextResponse.json({ error: message }, { status: 404 });
  },

  conflict: (message: string) => {
    return NextResponse.json({ error: message }, { status: 409 });
  },

  internalError: (message = 'Internal Server Error') => {
    return NextResponse.json({ error: message }, { status: 500 });
  },
};

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Validates request body against a Zod schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const validation = schema.safeParse(body);

    if (!validation.success) {
      return {
        success: false,
        response: ApiResponse.badRequest(
          'Invalid request data',
          validation.error.flatten()
        ),
      };
    }

    return { success: true, data: validation.data };
  } catch (error) {
    return {
      success: false,
      response: ApiResponse.badRequest('Invalid JSON in request body'),
    };
  }
}

/**
 * Parses and validates query parameters
 */
export function parseQueryParams(
  request: NextRequest,
  schema: z.ZodSchema
): { success: true; data: any } | { success: false; response: NextResponse } {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());

  const validation = schema.safeParse(params);

  if (!validation.success) {
    return {
      success: false,
      response: ApiResponse.badRequest(
        'Invalid query parameters',
        validation.error.flatten()
      ),
    };
  }

  return { success: true, data: validation.data };
}

/**
 * Common query parameter schemas
 */
export const QuerySchemas = {
  id: z.object({
    id: z.string().refine((val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0, {
      message: "ID must be a positive integer"
    }).transform((val) => parseInt(val, 10))
  }),

  groupId: z.object({
    groupId: z.string().refine((val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0, {
      message: "Group ID must be a positive integer"
    }).transform((val) => parseInt(val, 10))
  }),

  eventId: z.object({
    eventId: z.string().refine((val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0, {
      message: "Event ID must be a positive integer"
    }).transform((val) => parseInt(val, 10))
  }),

  optionalEventId: z.object({
    eventId: z.string().refine((val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0, {
      message: "Event ID must be a positive integer"
    }).transform((val) => parseInt(val, 10)).optional()
  }),

  groupIdOrEventId: z.object({
    groupId: z.string().refine((val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0).transform((val) => parseInt(val, 10)).optional(),
    eventId: z.string().refine((val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0).transform((val) => parseInt(val, 10)).optional()
  }).refine((data) => data.groupId || data.eventId, {
    message: 'Either groupId or eventId parameter is required',
  }),
};

// =============================================================================
// ERROR HANDLING WRAPPER
// =============================================================================

/**
 * Wraps API route handlers with standardized error handling
 */
export function withErrorHandler(
  handler: (request: NextRequest) => Promise<NextResponse | any>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const result = await handler(request);
      
      // If handler returns a NextResponse, return it directly
      if (result instanceof NextResponse) {
        return result;
      }
      
      // Otherwise, wrap in success response
      return ApiResponse.success(result);
    } catch (error) {
      console.error('API Error:', error);
      
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        return ApiResponse.badRequest('Validation failed', error.flatten());
      }
      
      // Handle known error types
      if (error instanceof Error) {
        // Check for specific error patterns
        if (error.message.includes('not found')) {
          return ApiResponse.notFound(error.message);
        }
        
        if (error.message.includes('already exists')) {
          return ApiResponse.conflict(error.message);
        }
      }
      
      // Default to internal server error
      return ApiResponse.internalError();
    }
  };
}

// =============================================================================
// REQUEST HELPERS
// =============================================================================

/**
 * Safely parses integer from string, with validation
 */
export function parseId(value: string | null, fieldName = 'ID'): number {
  if (!value) {
    throw new Error(`${fieldName} is required`);
  }
  
  const parsed = parseInt(value, 10);
  
  if (isNaN(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
  
  return parsed;
}

/**
 * Safely gets required query parameter
 */
export function getRequiredParam(
  searchParams: URLSearchParams,
  param: string
): string {
  const value = searchParams.get(param);
  if (!value) {
    throw new Error(`${param} parameter is required`);
  }
  return value;
}

/**
 * Safely gets optional query parameter
 */
export function getOptionalParam(
  searchParams: URLSearchParams,
  param: string
): string | null {
  return searchParams.get(param);
}

// =============================================================================
// COMMON MIDDLEWARE PATTERNS
// =============================================================================

/**
 * Validates that required query parameters exist
 */
export function requireQueryParams(
  request: NextRequest,
  ...params: string[]
): { success: true; searchParams: URLSearchParams } | { success: false; response: NextResponse } {
  const { searchParams } = new URL(request.url);
  
  for (const param of params) {
    if (!searchParams.has(param)) {
      return {
        success: false,
        response: ApiResponse.badRequest(`${param} parameter is required`),
      };
    }
  }
  
  return { success: true, searchParams };
}

/**
 * Validates request method
 */
export function validateMethod(
  request: NextRequest,
  allowedMethods: string[]
): { success: true } | { success: false; response: NextResponse } {
  if (!allowedMethods.includes(request.method)) {
    return {
      success: false,
      response: NextResponse.json(
        { error: `Method ${request.method} not allowed` },
        { status: 405 }
      ),
    };
  }
  
  return { success: true };
}

// =============================================================================
// TYPED API HANDLERS
// =============================================================================

/**
 * Creates a type-safe API route handler with built-in validation
 */
export function createApiHandler<TQuery = any, TBody = any>(config: {
  querySchema?: z.ZodSchema<TQuery>;
  bodySchema?: z.ZodSchema<TBody>;
  allowedMethods?: string[];
}) {
  return (
    handler: (params: {
      request: NextRequest;
      query: TQuery;
      body: TBody;
    }) => Promise<NextResponse | any>
  ) => {
    return withErrorHandler(async (request: NextRequest) => {
      // Validate method
      if (config.allowedMethods) {
        const methodValidation = validateMethod(request, config.allowedMethods);
        if (!methodValidation.success) {
          return methodValidation.response;
        }
      }

      // Parse and validate query parameters
      let query: TQuery = {} as TQuery;
      if (config.querySchema) {
        const queryValidation = parseQueryParams(request, config.querySchema);
        if (!queryValidation.success) {
          return queryValidation.response;
        }
        query = queryValidation.data;
      }

      // Parse and validate request body
      let body: TBody = {} as TBody;
      if (config.bodySchema && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const bodyValidation = await validateRequestBody(request, config.bodySchema);
        if (!bodyValidation.success) {
          return bodyValidation.response;
        }
        body = bodyValidation.data;
      }

      // Call the actual handler
      return await handler({ request, query, body });
    });
  };
} 