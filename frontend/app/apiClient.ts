// Centralized API client for all fetch operations
import { API_BASE_URL } from './config';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
  // Optionally add auth token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };
  const response = await fetch(url, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'API error');
  return data;
}

// Usage: await apiFetch('/orders', { method: 'GET' })
