import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Get Firebase config from environment variables
  const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY || '',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: env.VITE_FIREBASE_APP_ID || '',
  };

  return {
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'logo-192.png', 'logo-512.png', 'apple-touch-icon.png', 'favicon.ico'],
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
            src: '/logo-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/logo-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/logo-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/logo-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
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
        ],
        // Improve installability
        prefer_related_applications: false,
        related_applications: []
      },
      devOptions: {
        enabled: true, // Enable in dev mode for testing PWA
        type: 'module' // Use module type for service worker
      },
      injectRegister: 'auto' // Automatically register service worker
    })
  ],
  define: {
    // Inject Firebase config into service worker at build time
    '__FIREBASE_API_KEY__': JSON.stringify(firebaseConfig.apiKey),
    '__FIREBASE_AUTH_DOMAIN__': JSON.stringify(firebaseConfig.authDomain),
    '__FIREBASE_PROJECT_ID__': JSON.stringify(firebaseConfig.projectId),
    '__FIREBASE_STORAGE_BUCKET__': JSON.stringify(firebaseConfig.storageBucket),
    '__FIREBASE_MESSAGING_SENDER_ID__': JSON.stringify(firebaseConfig.messagingSenderId),
    '__FIREBASE_APP_ID__': JSON.stringify(firebaseConfig.appId),
  },
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
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-router-dom',
      'leaflet',
      'react-leaflet'
    ],
    exclude: [],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // CRITICAL: Never split React - it must ALWAYS stay in the main bundle
          // Splitting React causes "Cannot set properties of undefined" errors
          // This check must come FIRST before any other chunking logic
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react/jsx') ||
              id.includes('node_modules/scheduler') ||
              id.includes('node_modules/object-assign')) {
            // Return undefined - React must NEVER be chunked
            return undefined;
          }
          
          // Only chunk non-React node_modules
          if (id.includes('node_modules')) {
            // React Router can be separate (it's safe, doesn't include React core)
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            // Firebase
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            // Charts and visualization
            if (id.includes('recharts') || id.includes('chart')) {
              return 'vendor-charts';
            }
            // Video/Media
            if (id.includes('twilio') || id.includes('video')) {
              return 'vendor-media';
            }
            // Maps
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'vendor-maps';
            }
            // Forms and validation
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'vendor-forms';
            }
            // UI libraries
            if (id.includes('@headlessui') || id.includes('@heroicons') || id.includes('framer-motion')) {
              return 'vendor-ui';
            }
            // Query and state management
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            // Date utilities
            if (id.includes('date-fns')) {
              return 'vendor-dates';
            }
            // All other node_modules (but NOT React)
            return 'vendor';
          }
          
          // DISABLED: Feature-based chunking causes React to be split incorrectly
          // Pages will be lazy-loaded but React stays in main bundle
          // This prevents "Cannot set properties of undefined" errors
          
          // Return undefined for everything else (React and all source files stay in main bundle)
          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  };
});
