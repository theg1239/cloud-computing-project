import Constants from 'expo-constants';
import { Platform } from 'react-native';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

function sanitizeUrl(u?: string | null) {
  if (!u) return '';
  if (u.includes('${') || u.includes('EXPO_PUBLIC_')) return '';
  return u.replace(/\/$/, '');
}
// Hardcoded override (dev tunnel)
const HARDCODED_API_URL = 'https://project.nptelprep.in';

const envUrl = sanitizeUrl(process.env.EXPO_PUBLIC_API_URL as any);
const extraUrl = sanitizeUrl(Constants.expoConfig?.extra?.API_URL as any);
let baseUrl = HARDCODED_API_URL || envUrl || extraUrl || '';
if (Platform.OS === 'android' && baseUrl.startsWith('http://localhost')) {
  baseUrl = baseUrl.replace('http://localhost', 'https://project.nptelprep.in');
}
export const API_URL = baseUrl;

// Logging control: enabled in dev or when EXPO_PUBLIC_API_LOG/extra.API_LOG is truthy
const EXTRA = Constants.expoConfig?.extra || {};
const ENV_LOG = (process.env.EXPO_PUBLIC_API_LOG || EXTRA.API_LOG || '').toString().toLowerCase();
const IS_DEV = typeof __DEV__ !== 'undefined' ? __DEV__ : (process.env.NODE_ENV !== 'production');
const LOG_ENABLED = IS_DEV || ENV_LOG === '1' || ENV_LOG === 'true';

let __reqCounter = 0;
function nextReqId() {
  __reqCounter = (__reqCounter + 1) % 100000;
  return `${Date.now().toString(36)}-${__reqCounter}`;
}
function maskToken(token?: string | null) {
  if (!token) return undefined;
  const t = String(token);
  if (t.length <= 8) return '***';
  return `${t.slice(0, 2)}***${t.slice(-4)}`;
}
function truncate(val: any, max = 2000) {
  const s = typeof val === 'string' ? val : JSON.stringify(val);
  return s.length > max ? s.slice(0, max) + `... [${s.length - max} more chars]` : s;
}

async function handleResponse(res: Response, log?: { id: string; startedAt: number; url: string; method: string }) {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json() : await res.text();
  if (LOG_ENABLED && log) {
    const duration = Date.now() - log.startedAt;
    console.log(
      `[API][${log.id}] <= ${res.status} ${res.statusText} (${duration}ms) ${log.method} ${log.url}\n` +
        `Headers: ${truncate(Object.fromEntries(res.headers.entries()))}\n` +
        `Body: ${truncate(body)}`
    );
  }
  if (!res.ok) {
    const msg = isJson ? body?.error || body?.message || 'Request failed' : body;
    throw new Error(msg);
  }
  return body;
}

export async function gqlRequest<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
  if (!API_URL) throw new Error('API_URL not configured. Set EXPO_PUBLIC_API_URL.');
  const id = nextReqId();
  const url = `${API_URL}/graphql`;
  const startedAt = Date.now();
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(authToken ? { 'x-user': authToken } : {}),
  };
  const body = { query, variables };
  if (LOG_ENABLED) {
    console.log(
      `[API][${id}] => POST ${url}\nHeaders: ${truncate({ ...headers, 'x-user': maskToken(authToken) })}\nBody: ${truncate({ ...body, query })}`
    );
  }
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  } catch (err: any) {
    if (LOG_ENABLED) console.log(`[API][${id}] !! Network error: ${err?.message || String(err)}`);
    throw new Error(`Network request failed: ${err?.message || String(err)}`);
  }
  const json = await handleResponse(res, { id, startedAt, url, method: 'POST' });
  if (json.errors?.length) throw new Error(json.errors[0].message || 'GraphQL error');
  return json.data as T;
}

export async function restGet<T = any>(path: string): Promise<T> {
  if (!API_URL) throw new Error('API_URL not configured. Set EXPO_PUBLIC_API_URL.');
  const id = nextReqId();
  const url = `${API_URL}${path}`;
  const startedAt = Date.now();
  const headers: Record<string, string> = {
    ...(authToken ? { 'x-user': authToken } : {}),
  };
  if (LOG_ENABLED) {
    console.log(`[API][${id}] => GET ${url}\nHeaders: ${truncate({ ...headers, 'x-user': maskToken(authToken) })}`);
  }
  let res: Response;
  try {
    res = await fetch(url, { headers });
  } catch (err: any) {
    if (LOG_ENABLED) console.log(`[API][${id}] !! Network error: ${err?.message || String(err)}`);
    throw new Error(`Network request failed: ${err?.message || String(err)}`);
  }
  return handleResponse(res, { id, startedAt, url, method: 'GET' });
}

export async function restPost<T = any>(path: string, body: any): Promise<T> {
  if (!API_URL) throw new Error('API_URL not configured. Set EXPO_PUBLIC_API_URL.');
  const id = nextReqId();
  const url = `${API_URL}${path}`;
  const startedAt = Date.now();
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(authToken ? { 'x-user': authToken } : {}),
  };
  if (LOG_ENABLED) {
    console.log(
      `[API][${id}] => POST ${url}\nHeaders: ${truncate({ ...headers, 'x-user': maskToken(authToken) })}\nBody: ${truncate(body)}`
    );
  }
  let res: Response;
  try {
    res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  } catch (err: any) {
    if (LOG_ENABLED) console.log(`[API][${id}] !! Network error: ${err?.message || String(err)}`);
    throw new Error(`Network request failed: ${err?.message || String(err)}`);
  }
  return handleResponse(res, { id, startedAt, url, method: 'POST' });
}

export async function restPostMaybe<T = any>(path: string, body: any): Promise<{ ok: boolean; status: number; data?: T; error?: any }>{
  if (!API_URL) return { ok: false, status: 0, error: 'API_URL not configured' };
  const id = nextReqId();
  const url = `${API_URL}${path}`;
  const startedAt = Date.now();
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(authToken ? { 'x-user': authToken } : {}),
  };
  if (LOG_ENABLED) {
    console.log(
      `[API][${id}] => POST ${url}\nHeaders: ${truncate({ ...headers, 'x-user': maskToken(authToken) })}\nBody: ${truncate(body)}`
    );
  }
  try {
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await res.json() : await res.text();
    if (LOG_ENABLED) {
      const duration = Date.now() - startedAt;
      console.log(
        `[API][${id}] <= ${res.status} ${res.statusText} (${duration}ms) POST ${url}\nHeaders: ${truncate(
          Object.fromEntries(res.headers.entries())
        )}\nBody: ${truncate(data)}`
      );
    }
    if (!res.ok) return { ok: false, status: res.status, error: data } as any;
    return { ok: true, status: res.status, data } as any;
  } catch (err: any) {
    if (LOG_ENABLED) console.log(`[API][${id}] !! Network error: ${err?.message || String(err)}`);
    return { ok: false, status: 0, error: `Network request failed: ${err?.message || String(err)}` };
  }
}

export async function restPatch<T = any>(path: string, body: any): Promise<T> {
  if (!API_URL) throw new Error('API_URL not configured. Set EXPO_PUBLIC_API_URL.');
  const id = nextReqId();
  const url = `${API_URL}${path}`;
  const startedAt = Date.now();
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(authToken ? { 'x-user': authToken } : {}),
  };
  if (LOG_ENABLED) {
    console.log(
      `[API][${id}] => PATCH ${url}\nHeaders: ${truncate({ ...headers, 'x-user': maskToken(authToken) })}\nBody: ${truncate(body)}`
    );
  }
  let res: Response;
  try {
    res = await fetch(url, { method: 'PATCH', headers, body: JSON.stringify(body) });
  } catch (err: any) {
    if (LOG_ENABLED) console.log(`[API][${id}] !! Network error: ${err?.message || String(err)}`);
    throw new Error(`Network request failed: ${err?.message || String(err)}`);
  }
  return handleResponse(res, { id, startedAt, url, method: 'PATCH' });
}
