import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // 상대 경로로 빌드 (정적 호스팅용)
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 이미지 파일을 assets에 포함
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'img';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})