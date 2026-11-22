import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: { license: { fileName: 'licenses.txt' } },
  // Relative paths, so the built app also works inside a sub-folder on the school server
  base: './',
})
