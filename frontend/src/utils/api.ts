const BASE_URL = 'http://127.0.0.1:3200'; // change to your API URL

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