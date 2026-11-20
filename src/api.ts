const SESSION_TOKEN_KEY = 'cloudsoc_session_token';
const CSRF_TOKEN_KEY = 'cloudsoc_csrf_token';

function readStorage(key: string): string {
  try {
    return window.sessionStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

function writeStorage(key: string, value: string) {
  try {
    if (value) {
      window.sessionStorage.setItem(key, value);
    } else {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // Ignore restricted storage contexts
  }
}

let sessionTokenStore = typeof window !== 'undefined' ? readStorage(SESSION_TOKEN_KEY) : '';
let csrfTokenStore = typeof window !== 'undefined' ? readStorage(CSRF_TOKEN_KEY) : '';

export function setAuthSession(sessionToken: string, csrfToken: string) {
  sessionTokenStore = sessionToken;
  csrfTokenStore = csrfToken;
  writeStorage(SESSION_TOKEN_KEY, sessionToken);
  writeStorage(CSRF_TOKEN_KEY, csrfToken);
}

export function clearAuthSession() {
  sessionTokenStore = '';
  csrfTokenStore = '';
  writeStorage(SESSION_TOKEN_KEY, '');
  writeStorage(CSRF_TOKEN_KEY, '');
}

export function setCsrfToken(token: string) {
  csrfTokenStore = token;
  writeStorage(CSRF_TOKEN_KEY, token);
}

export function getCsrfToken(): string {
  return csrfTokenStore;
}

export function getAuthHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra || {});
  if (sessionTokenStore && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${sessionTokenStore}`);
  }
  return headers;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetchRaw(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = getAuthHeaders(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && csrfTokenStore) {
    headers.set('X-CSRF-Token', csrfTokenStore);
  }

  return fetch(path, {
    ...options,
    headers,
    credentials: 'include',
  });
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await apiFetchRaw(path, options);

  if (!res.ok) {
    let errMsg = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) errMsg = data.error;
    } catch {
      // ignore JSON parse failure
    }
    throw new ApiError(res.status, errMsg);
  }

  return (await res.json()) as T;
}

export function formatTimestamp(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}
