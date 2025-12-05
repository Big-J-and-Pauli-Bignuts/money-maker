import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // Uncomment and set base path if deploying to GitHub Pages subdirectory
  // base: '/money-maker/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    port: 5173,
    host: true, // Listen on all addresses including LAN and public
    strictPort: false, // Allow Vite to use next available port
    open: false, // Don't auto-open browser in Codespaces
    cors: true, // Enable CORS
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022', // Support top-level await
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'fluent-ui': ['@fluentui/react', '@fluentui/react-components'],
          'msal': ['@azure/msal-browser', '@azure/msal-react'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
