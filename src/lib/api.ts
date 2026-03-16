export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const apiFetch = async (endpoint: string, options?: RequestInit) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(data.message || 'API Error');
  }

  return data;
};
