import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/web-push-notifications/service-worker.js',
          dest: '' // Copies to build output root
        }
      ]
    })
  ],
  server: {
    port: 3000,
    allowedHosts: true,
    host: true
  }
})
