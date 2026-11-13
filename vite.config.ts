import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  // ใช้ '/thaiwsk2026/' สำหรับ build บน GitHub Pages และ '/' สำหรับ dev server บนพอร์ต 3000
  base: command === 'build' ? '/thaiwsk2026/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
}));
