/**
 * API Mock for Unit Tests
 * 
 * Provides mock API responses for unit testing.
 * 
 * Usage:
 * ```typescript
 * import { mockApiResponse, mockApiError } from '../../mocks/api';
 * 
 * // Mock successful response
 * global.fetch = vi.fn().mockResolvedValue(mockApiResponse({ data: [...] }));
 * 
 * // Mock error response
 * global.fetch = vi.fn().mockResolvedValue(mockApiError('Not found', 404));
 * ```
 */

import { vi } from 'vitest';

/**
 * Create mock successful API response
 */
export function mockApiResponse<T>(
  data: T,
  options: {
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
  } = {}
): Response {
  const { status = 200, statusText = 'OK', headers = {} } = options;

  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    headers: new Headers(headers),
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
    blob: vi.fn().mockResolvedValue(new Blob()),
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
  } as any as Response;
}

/**
 * Create mock API error response
 */
export function mockApiError(
  message: string,
  status: number = 500,
  options: {
    statusText?: string;
    code?: string;
  } = {}
): Response {
  const { statusText = 'Error', code = 'API_ERROR' } = options;

  const errorData = {
    error: {
      message,
      code,
      status,
    },
  };

  return mockApiResponse(errorData, {
    status,
    statusText,
  });
}

/**
 * Mock fetch implementation
 */
export function createMockFetch(defaultResponse: any = {}) {
  return vi.fn().mockResolvedValue(mockApiResponse(defaultResponse));
}

