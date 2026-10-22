import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? (process.env.VITE_BASE_PATH || '/admitbridge/admin/') : '/',
  plugins: [react()],
  server: {
    // Port 5175 as defined in System Architecture (see root README.md)
    port: 5175
  }
}))
