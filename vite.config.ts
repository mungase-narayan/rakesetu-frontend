import { defineConfig } from 'vite';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // import.meta.dirname, not __dirname: the native config loader Vite is
      // moving to does not define __dirname.
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  server: {
    // 5175 so this can run alongside college-level-frontend (5174).
    port: 5175,
  },
});
