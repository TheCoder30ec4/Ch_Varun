import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: "/Ch_Varun/",
  plugins: [react()],
  root: '.',
  build:{
    outDir:'dist',
    emptyOutDir:true,
  },
})
