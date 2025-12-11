import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from "node:path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@components': resolve(__dirname, './imagenes/components'),
            '@pages': resolve(__dirname, './imagenes/pages'),
            '@context': resolve(__dirname, './imagenes/contexts'),
            '@styles': resolve(__dirname, './imagenes/styles'),
            '@data': resolve(__dirname, './imagenes/data'),
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
