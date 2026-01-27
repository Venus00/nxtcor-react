// hooks/api.ts
const API_BASE = `http://${window.location.hostname}:3000/api`;

// Base fetcher function
export async function apiFetch<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (body && method === 'POST') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}