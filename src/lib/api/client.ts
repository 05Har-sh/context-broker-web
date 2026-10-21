import { getKeycloakInstance } from '@/lib/keycloak';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(401, message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = 'You do not have permission to perform this action.') {
    super(403, message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message = 'Too many requests. Please try again shortly.') {
    super(429, message);
    this.name = 'RateLimitError';
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

/** Minimum token validity in seconds before we attempt refresh. */
const MIN_TOKEN_VALIDITY = 15;

export async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = 'An unexpected error occurred';
    try {
      const errorData = await res.json();
      message = errorData.message || errorData.error || message;
    } catch {
      message = res.statusText || message;
    }

    switch (res.status) {
      case 401: throw new AuthenticationError(message);
      case 403: throw new AuthorizationError(message);
      case 404: throw new NotFoundError(message);
      case 429: throw new RateLimitError(message);
      default: throw new ApiError(res.status, message);
    }
  }

  // Handle empty responses
  const text = await res.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

/**
 * Obtain the current access token from Keycloak, refreshing if needed.
 * Returns null if the user is not authenticated or refresh fails.
 */
async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const kc = getKeycloakInstance();
    if (kc.authenticated) {
      // Attempt to refresh if the token will expire within MIN_TOKEN_VALIDITY seconds
      await kc.updateToken(MIN_TOKEN_VALIDITY);
      if (kc.token) return kc.token;
    }
  } catch {
    // Continue to fallback
  }

  try {
    const savedToken = localStorage.getItem('kc_access_token');
    if (savedToken) return savedToken;
  } catch {
    // ignore
  }

  return null;
}

interface FetchOptions extends RequestInit {
  /** Whether this request requires authentication. Defaults to true. */
  requireAuth?: boolean;
}

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { requireAuth = true, headers, ...customConfig } = options;

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...(customConfig.body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
  };

  if (requireAuth) {
    const token = await getAccessToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  // On 401, attempt token refresh once and retry
  if (response.status === 401 && requireAuth) {
    try {
      const kc = getKeycloakInstance();
      await kc.updateToken(-1); // Force refresh
      const newToken = kc.token || (typeof window !== 'undefined' ? localStorage.getItem('kc_access_token') : null);

      if (newToken) {
        const retryConfig: RequestInit = {
          ...customConfig,
          headers: {
            ...(customConfig.body ? { 'Content-Type': 'application/json' } : {}),
            ...headers,
            Authorization: `Bearer ${newToken}`,
          },
        };
        const retryResponse = await fetch(`${API_BASE}${endpoint}`, retryConfig);
        return handleResponse<T>(retryResponse);
      }
    } catch {
      // Token refresh failed — throw the original 401
    }
  }

  return handleResponse<T>(response);
}
