import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Set '/SelyoPass/' for the canonical GitHub Pages build.
  base: process.env.VITE_BASE_PATH || '/',
  define: {
    global: 'globalThis',
  },
});
