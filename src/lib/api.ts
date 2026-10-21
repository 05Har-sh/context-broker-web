import { getKeycloakInstance } from '@/lib/keycloak';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

// --- Custom Error Classes for structured handling ---
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') { super(401, message); }
}

export class AuthorizationError extends ApiError {
  constructor(message = "You don't have permission to perform this action.") { super(403, message); }
}

export class RateLimitError extends ApiError {
  constructor(message = 'Too many requests. Please try again later.') { super(429, message); }
}

// --- Helper to handle standard responses ---
async function handleResponse(res: Response) {
  if (res.ok) {
    // If empty response (like 204 No Content), return empty object
    if (res.status === 204) return {};
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  }

  if (res.status === 401) throw new AuthenticationError();
  if (res.status === 403) throw new AuthorizationError();
  if (res.status === 429) throw new RateLimitError();
  
  // Parse error body if possible
  const errorText = await res.text().catch(() => '');
  let errorMessage = `API request failed with status ${res.status}`;
  try {
    const errorJson = JSON.parse(errorText);
    errorMessage = errorJson.message || errorJson.error || errorMessage;
  } catch {
    if (errorText) errorMessage = errorText;
  }
  
  throw new ApiError(res.status, errorMessage);
}

/**
 * Builds authorization headers from the Keycloak token when available.
 * Safe to call in any context (returns empty object on server or when unauthenticated).
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  if (typeof window === 'undefined') return {};
  try {
    const kc = getKeycloakInstance();
    if (!kc.authenticated) return {};
    await kc.updateToken(15);
    if (kc.token) {
      return { Authorization: `Bearer ${kc.token}` };
    }
  } catch {
    // Token refresh failed — proceed without auth
  }
  return {};
}

// SWR fetcher for client-side usage (now attaches real token)
export const fetcher = async (url: string) => {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${url}`, {
    cache: 'no-store',
    headers: { ...authHeaders },
  });
  return handleResponse(res);
};

async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const authHeaders = await getAuthHeaders();
  return fetch(url, {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  });
}

export async function getIncident(incidentKey: string) {
  const res = await authenticatedFetch(`${API_BASE}/incident/${incidentKey}`, { cache: 'no-store' });
  return handleResponse(res);
}

export async function getIncidentTimeline(incidentKey: string) {
  const res = await authenticatedFetch(`${API_BASE}/incident/${incidentKey}/timeline`, { cache: 'no-store' });
  return handleResponse(res);
}

export async function getIncidentDetails(incidentKey: string) {
  const res = await authenticatedFetch(`${API_BASE}/incident/incident-details/${incidentKey}`, { cache: 'no-store' });
  return handleResponse(res);
}

export async function getMetrics() {
  const res = await authenticatedFetch(`${API_BASE}/incident/metrics`, { cache: 'no-store' });
  return handleResponse(res);
}

export async function getAllIncidents(
  page: number = 0,
  size: number = 10,
  filters?: { severity?: string; assignedTo?: string; stale?: boolean | string; jiraStatus?: string }
) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('size', String(size));
  if (filters?.severity) params.set('severity', filters.severity);
  if (filters?.assignedTo) params.set('assignedTo', filters.assignedTo);
  if (filters?.stale !== undefined) params.set('stale', String(filters.stale));
  if (filters?.jiraStatus) params.set('jiraStatus', filters.jiraStatus);
  const res = await authenticatedFetch(
    `${API_BASE}/incident/all?${params.toString()}`,
    { cache: 'no-store' }
  );
  return handleResponse(res);
}

export async function getSystemHealth() {
  const res = await authenticatedFetch(`${API_BASE}/incident/system-health`, { cache: 'no-store' });
  return handleResponse(res);
}

export async function getIncidentRiskScore(incidentKey: string) {
  const res = await authenticatedFetch(`${API_BASE}/incident/risk-score/${incidentKey}`, { cache: 'no-store' });
  return handleResponse(res);
}

export async function getIncidentPriority(incidentKey: string) {
  const res = await authenticatedFetch(`${API_BASE}/incident/priority/${incidentKey}`, { cache: 'no-store' });
  return handleResponse(res);
}

export async function getHighestRisk() {
  const res = await authenticatedFetch(`${API_BASE}/incident/highest-risk`, { cache: 'no-store' });
  return handleResponse(res);
}

export async function getSeverityDistribution() {
  const res = await authenticatedFetch(`${API_BASE}/incident/severity-distribution`, { cache: 'no-store' });
  return handleResponse(res);
}

export async function getStatusDistribution() {
  const res = await authenticatedFetch(`${API_BASE}/incident/status-distribution`, { cache: 'no-store' });
  return handleResponse(res);
}

export async function getTrend() {
  const res = await authenticatedFetch(`${API_BASE}/incident/trend`, { cache: 'no-store' });
  return handleResponse(res);
}

export async function assignIncident(incidentKey: string, assignedTo: string) {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/incident/${incidentKey}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify({ assignedTo }),
  });
  return handleResponse(res);
}
