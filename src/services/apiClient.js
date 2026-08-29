import axios from 'axios';
import { getSession } from 'next-auth/react';

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    // Inyectar el token de sesión de NextAuth si está disponible (lado del cliente)
    if (typeof window !== 'undefined') {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    } else {
      console.warn('apiClient.js se está usando en el lado del servidor (SSR). getSession() no inyectará el token.');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
