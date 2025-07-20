import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // esbuild를 사용하여 minify (terser 대신)
    minify: 'esbuild',
    esbuild: {
      drop: ['console', 'debugger'],
    }
  }
})