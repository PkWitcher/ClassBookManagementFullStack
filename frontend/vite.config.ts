import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // This makes Vite listen on all network interfaces inside the container
    port: 3000,      // This is the internal port Vite listens on
    strictPort: true // Ensures if port is in use, it will fail rather than pick another
  }
})
