import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://akkoma.mercurywork.shop',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/oauth': {
        target: 'https://akkoma.mercurywork.shop',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    },
  },
  plugins: [
    // crossOriginIsolation()
    [mkcert()]
  ]
})
