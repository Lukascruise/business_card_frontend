/**
 * API 클라이언트
 * MVP: fetch 기반, 단순한 래퍼
 */

import { auth } from './auth';
import { API_BASE_URL, AUTH_HEADER_PREFIX } from './constants';

/** API 에러 응답 형식 (백엔드 success: false, error: { code, message, detail }) */
export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    detail: unknown;
  };
}

export interface ApiError {
  status: number;
  message?: string;
  code?: string;
  detail?: unknown;
}

/**
 * API 요청 옵션
 */
interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * API 요청 래퍼
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requireAuth = true, ...fetchOptions } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = auth.getToken();
    if (token) {
      headers['Authorization'] = `${AUTH_HEADER_PREFIX} ${token}`;
    }
  }

  if (fetchOptions.headers) {
    const custom =
      fetchOptions.headers instanceof Headers
        ? Object.fromEntries(fetchOptions.headers.entries())
        : Array.isArray(fetchOptions.headers)
          ? Object.fromEntries(fetchOptions.headers as [string, string][])
          : (fetchOptions.headers as Record<string, string>);
    Object.assign(headers, custom);
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    let message = `API Error: ${response.statusText}`;
    let code: string | undefined;
    let detail: unknown;
    try {
      const body = await response.json();
      if (body && typeof body === 'object' && body.success === false && body.error && typeof body.error === 'object') {
        const err = body.error as { message?: string; code?: string; detail?: unknown };
        if (typeof err.message === 'string' && err.message.trim()) message = err.message;
        if (typeof err.code === 'string') code = err.code;
        if (err.detail !== undefined) detail = err.detail;
      }
    } catch {
      // non-JSON or empty body
    }
    const error: ApiError = { status: response.status, message, code, detail };
    throw error;
  }

  // 204 No Content 등 빈 응답 처리
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * API 클라이언트
 */
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions): Promise<T> => {
    return apiRequest<T>(endpoint, { ...options, method: 'GET' });
  },

  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete: <T>(endpoint: string, options?: RequestOptions): Promise<T> => {
    return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
