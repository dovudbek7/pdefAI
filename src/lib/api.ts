const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000';

async function refreshTokens(): Promise<string | null> {
  const refresh = localStorage.getItem('kitob-refresh');
  if (!refresh) return null;
  try {
    const res = await fetch(`${BASE}/api/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) {
      localStorage.removeItem('kitob-access');
      localStorage.removeItem('kitob-refresh');
      return null;
    }
    const data = await res.json() as { access: string };
    localStorage.setItem('kitob-access', data.access);
    return data.access;
  } catch {
    return null;
  }
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('kitob-access');
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let res = await fetch(`${BASE}${path}`, { ...init, headers });

  if (res.status === 401) {
    const newToken = await refreshTokens();
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      res = await fetch(`${BASE}${path}`, { ...init, headers });
    } else {
      const here = window.location.pathname;
      if (here !== '/login' && here !== '/register') {
        window.location.href = '/login';
      }
    }
  }

  return res;
}
