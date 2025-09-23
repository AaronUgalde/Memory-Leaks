// src/lib/api.ts
import axios from 'axios';

const API_BASE = process.env.API || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // true si usas cookie httpOnly
});

// función para setear token en runtime
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export default api;
