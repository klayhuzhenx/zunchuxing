import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// https://vitejs.dev/config/
export default defineConfig({
  base:'/zun/ckdh5/',
  plugins: [
    uni(),
  ],
})
