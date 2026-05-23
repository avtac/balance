import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const root = resolve(__dirname, 'src');

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  {
    name: 'remove-path-from-html',
    enforce: 'post',
    generateBundle(_, bundle) {
      for (const [fileName, outputItem] of Object.entries(bundle)) {
        if (outputItem.type === 'asset' && fileName.endsWith('.html'))
          outputItem.fileName = fileName.replace('src/pages/', '');
      }
    }
  }],
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        config: resolve(root, 'pages/config/index.html'),
      },
      output: {
        dir: 'dist',
      }
    }
  }
})
