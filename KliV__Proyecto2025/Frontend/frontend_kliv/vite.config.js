import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from "node:path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@components': resolve(__dirname, './src/components'),
            '@pages': resolve(__dirname, './src/pages'),
            '@context': resolve(__dirname, './src/contexts'),
            '@styles': resolve(__dirname, './src/styles'),
            '@data': resolve(__dirname, './src/data'),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@import "@styles/index.scss";`
            }
        }
    }
})
