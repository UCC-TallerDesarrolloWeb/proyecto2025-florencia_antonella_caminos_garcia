import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // alias comunes
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@contexts': fileURLToPath(new URL('./src/contexts', import.meta.url)),
            '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
            '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
            '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
            '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        }
    }
})
