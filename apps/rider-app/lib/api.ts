const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3002/v1'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).message ?? `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  get: <T>(path: string, token?: string) =>
    request<T>(path, token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    }),
  patch: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    }),
}
