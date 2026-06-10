import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// בסיס יחסי כדי שהאפליקציה תעבוד גם כשמגישים אותה מתת-תיקייה (GitHub Pages וכו')
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'הפרשת תרומות ומעשרות',
        short_name: 'הפרשה',
        description: 'בניית נוסח ההפרשה המדויק והנחיות שלב-אחר-שלב',
        lang: 'he',
        dir: 'rtl',
        theme_color: '#1f7a4d',
        background_color: '#faf7f0',
        display: 'standalone',
        start_url: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}']
      }
    })
  ]
})
