import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // แก้ไขชื่อ path ให้ตรงกับชื่อ Repository ของคุณ (ลบขีดกลางออกเป็น /thaiwsk2026/)
  const base = process.env.GITHUB_ACTIONS ? '/thaiwsk2026/' : (process.env.VITE_BASE_PATH || './');

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
