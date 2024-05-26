import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

console.log(import.meta.env);

// https://vitejs.dev/config/
export default defineConfig({
  base: import.meta.env.GITHUB_ACTIONS_BASE ?? '/',
  plugins: [react()],
})
