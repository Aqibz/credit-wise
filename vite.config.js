import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    build: {
        cssMinify: false,
    },
    server: {
        host: '127.0.0.1',
        port: 5173,
        strictPort: true,
        hmr: {
            host: '127.0.0.1',
        },
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./resources/js/installem', import.meta.url)),
            '@tanstack/react-router': fileURLToPath(new URL('./resources/js/installem/router-shim.tsx', import.meta.url)),
        },
    },
    plugins: [
        tailwindcss(),
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
});
