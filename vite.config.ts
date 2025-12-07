import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // GitHub Pagesなどのサブディレクトリ展開に対応
  define: {
    'process.env': {} // ブラウザ環境でのクラッシュ防止
  }
})