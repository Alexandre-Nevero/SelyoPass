import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Use '/' for Vercel/Netlify (root hosting). Set '/SelyoPass/' only for
  // GitHub Pages. Controlled via env var so CI/deploy can override if needed.
  base: process.env.VITE_BASE_PATH || '/',
  define: {
    global: 'globalThis',
  },
});
