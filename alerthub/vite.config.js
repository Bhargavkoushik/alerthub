import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {},
  optimizeDeps: {
    include: ['framer-motion']
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  }
})
