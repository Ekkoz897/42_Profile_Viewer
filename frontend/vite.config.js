import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,      // serve dev app on 3000
    strictPort: true,// fail instead of auto-switching if 3000 is in use
    host: true,      // listen on 0.0.0.0 (useful in containers/LAN)
    // optional: proxy API to Django so you can call `/api/...` in code
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
