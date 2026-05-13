import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  build: {
    minify: 'esbuild',
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'spa-fallback-preview',
      configurePreviewServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (
            req.method === 'GET' &&
            req.url &&
            !req.url.startsWith('/assets/') &&
            !req.url.includes('.') &&
            req.headers.accept?.includes('text/html')
          ) {
            req.url = '/'
          }
          next()
        })
      },
    },
  ],
  appType: 'spa',
})
