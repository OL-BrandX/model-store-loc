import { defineConfig, loadEnv } from 'vite'

// vite.config.js
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '')

  // Validate required environment variables
  if (!env.VITE_MAPBOX_ACCESS_TOKEN) {
    // Warning: VITE_MAPBOX_ACCESS_TOKEN is not set
  }

  return {
    plugins: [],
    server: {
      host: 'localhost',
      cors: '*',
      hmr: {
        host: 'localhost',
        protocol: 'ws',
      },
    },
    build: {
      minify: true,
      manifest: true,
      rollupOptions: {
        input: './src/main.js',
        output: {
          format: 'umd',
          entryFileNames: 'main.js',
          esModule: false,
          compact: true,
          globals: {
            jquery: '$',
          },
        },
        external: ['jquery'],
      },
    },
  }
})
