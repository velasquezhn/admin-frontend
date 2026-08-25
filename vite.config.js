import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = (env.VITE_API_URL || '').replace(/\/$/, '');

  if (mode === 'production' && !apiUrl) {
    throw new Error('VITE_API_URL es obligatoria para compilar producción');
  }

  return {
    plugins: [react()],
    define: {
      'process.env.REACT_APP_API_URL': JSON.stringify(apiUrl),
    },
    server: {
      proxy: {
        '/admin': 'http://localhost:4000',
        '/auth': 'http://localhost:4000',
        '/users': 'http://localhost:4000',
        '/health': 'http://localhost:4000',
        '/ready': 'http://localhost:4000',
        '/comprobantes': 'http://localhost:4000',
      },
    },
    test: {
      environment: 'node',
    },
  };
});
