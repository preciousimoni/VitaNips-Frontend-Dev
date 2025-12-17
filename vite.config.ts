import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'favicon.ico'],
      injectManifest: {
        maximumFileSizeToCacheInBytes: 5000000, // 5 MB limit
      },
      manifest: {
        name: 'VitaNips',
        short_name: 'VitaNips',
        description: 'VitaNips - Your Vitality, Our Priority. Comprehensive health management platform for appointments, prescriptions, and wellness tracking.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['health', 'medical', 'lifestyle'],
        screenshots: [
          {
            src: '/screenshots/landing-hero.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'VitaNips Landing Page'
          }
        ]
      },
      devOptions: {
        enabled: true, // Enable in dev mode for testing PWA
        type: 'module' // Use module type for service worker
      },
      injectRegister: 'auto' // Automatically register service worker
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@api': path.resolve(__dirname, './src/api'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
    },
  },
})
