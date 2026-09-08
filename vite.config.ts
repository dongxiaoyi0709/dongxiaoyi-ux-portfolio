import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { wgslVitePlugin } from '@vgpu/wgsl/loader-vite'
import { sites } from '@openai/sites-vite-plugin'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [wgslVitePlugin({ minify: mode === 'production' }), react(), tailwindcss(), sites()],
  build: {
    outDir: 'dist/client',
  },
}))
