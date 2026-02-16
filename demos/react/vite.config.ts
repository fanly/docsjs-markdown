import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@fanly/docsjs-markdown': '../../src/index.ts'
    }
  }
});
