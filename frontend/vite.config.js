import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'ohthanks.in',
      'api.ohthanks.in',
      'localhost'
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})  
