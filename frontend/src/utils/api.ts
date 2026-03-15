const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3200';

export const apiFetch = (path: string, options: RequestInit = {}) => {
  const session = localStorage.getItem('session');
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { session } : {}),
      ...options.headers,
    },
  });
};