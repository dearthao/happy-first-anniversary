import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // This must match the repository name exactly, including slashes
  base: '/happy-first-anniversary/', 
});