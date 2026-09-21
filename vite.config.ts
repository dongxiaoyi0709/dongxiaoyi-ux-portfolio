import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { wgslVitePlugin } from '@vgpu/wgsl/loader-vite'
import { sites } from '@openai/sites-vite-plugin'
import { createRequire } from 'node:module'
import { dirname } from 'node:path'

// Resolve both the API and Worker from React-PDF's exact dependency, even if
// another PDF.js version is installed elsewhere in node_modules.
const requireFromReactPdf = createRequire(createRequire(import.meta.url).resolve('react-pdf'))
const pdfjsDirectory = dirname(requireFromReactPdf.resolve('pdfjs-dist/package.json'))
const pdfjsVersion = requireFromReactPdf('pdfjs-dist/package.json').version as string

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // VGPU matches vertex attributes by name, so WGSL identifiers must stay intact.
  plugins: [wgslVitePlugin({ minify: mode === 'production' ? { whitespace: true, identifiers: 'none' } : false }), react(), tailwindcss(), sites()],
  resolve: { alias: { 'pdfjs-dist': pdfjsDirectory } },
  build: {
    outDir: 'dist/client',
    rollupOptions: {
      output: {
        assetFileNames: (asset) => asset.names.some((name) => name.startsWith('pdf.worker'))
          ? `assets/pdf.worker-${pdfjsVersion}-[hash][extname]`
          : 'assets/[name]-[hash][extname]',
      },
    },
  },
}))
