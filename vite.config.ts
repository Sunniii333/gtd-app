import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Installable, and the app shell opens with no network; data comes from Firestore's offline cache.
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'GTD',
        short_name: 'GTD',
        lang: 'th',
        display: 'standalone',
        background_color: '#f3efe4',
        theme_color: '#f3efe4',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}'], maximumFileSizeToCacheInBytes: 5_000_000 },
    }),
  ],
})
