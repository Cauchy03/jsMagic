import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import markdown from 'vite-plugin-c-markdown'

// @ts-ignore
// import markdown from '../../vite-plugin-markdown/dist/index.esm'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // @ts-ignore
    markdown()
  ],
  resolve:{
    alias: {
      '@': path.resolve('./src') // 相对路径别名配置，使用 @ 代替 src
    }
  },
})
