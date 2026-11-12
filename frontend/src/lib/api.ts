import type { Settings } from './types'

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? ''
const KEY = 'vh_session'

export interface Session { token: string; username: string; role: 'ADMIN' | 'CUSTOMER'; expiresAt: string; clockSkewMs: number }

export function loadSession(): Session | null {
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as Session | null
    if (s && new Date(s.expiresAt).getTime() > Date.now() + s.clockSkewMs) return s
  } catch { /* ignore */ }
  sessionStorage.removeItem(KEY)
  return null
}
export const saveSession = (s: Session) => sessionStorage.setItem(KEY, JSON.stringify(s))
export const clearSession = () => sessionStorage.removeItem(KEY)

let onUnauthorized: (() => void) | null = null
export const setUnauthorizedHandler = (fn: () => void) => { onUnauthorized = fn }

export class ApiError extends Error { constructor(public status: number, message: string) { super(message) } }

async function handle(res: Response, hadToken: boolean) {
  if (res.ok) return res
  let msg = res.statusText
  try { msg = (await res.json()).message ?? msg } catch { /* ignore */ }
  if (res.status === 401 && hadToken) onUnauthorized?.()
  throw new ApiError(res.status, msg)
}

export async function api<T = unknown>(path: string, opts: { method?: string; body?: unknown; form?: FormData } = {}): Promise<T> {
  const token = loadSession()?.token
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
  const res = await handle(await fetch(BASE + path, {
    method: opts.method ?? (opts.body !== undefined || opts.form ? 'POST' : 'GET'), headers,
    body: opts.form ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
  }), !!token)
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T)
}

/** Fetch an authenticated image as a blob (so the URL is not directly reusable outside the session). */
const blobCache = new Map<string, Promise<string>>()
export function imageBlobUrl(id: number, original = false): Promise<string> {
  const key = `${id}:${original}`
  let p = blobCache.get(key)
  if (!p) {
    const token = loadSession()?.token
    p = fetch(`${BASE}/api/media/${id}${original ? '?original=true' : ''}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => handle(r, !!token)).then((r) => r.blob()).then((b) => URL.createObjectURL(b))
    p.catch(() => blobCache.delete(key))
    blobCache.set(key, p)
  }
  return p
}
export const clearImageCache = () => { blobCache.forEach((p) => p.then((u) => URL.revokeObjectURL(u)).catch(() => {})); blobCache.clear() }

export async function login(username: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
  if (!res.ok) { let m = 'Login failed'; try { m = (await res.json()).message } catch { /* */ } throw new ApiError(res.status, m) }
  const d = await res.json() as { token: string; username: string; role: 'ADMIN' | 'CUSTOMER'; expiresAt: string; serverTime: string }
  const s: Session = { token: d.token, username: d.username, role: d.role, expiresAt: d.expiresAt, clockSkewMs: new Date(d.serverTime).getTime() - Date.now() }
  saveSession(s)
  return s
}
export const getPublicSettings = () => fetch(`${BASE}/api/public/settings`).then((r) => r.json() as Promise<Settings>)