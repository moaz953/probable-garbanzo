import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['vite.svg'],
            manifest: {
                name: 'AR-KEY Smart Keyboard',
                short_name: 'AR-KEY',
                description: 'Arabic Smart Keyboard with physical spacing',
                theme_color: '#1a1a1a',
                background_color: '#1a1a1a',
                display: 'standalone',
                orientation: 'landscape',
                icons: [
                    {
                        src: 'vite.svg',
                        sizes: '192x192',
                        type: 'image/svg+xml'
                    },
                    {
                        src: 'vite.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml'
                    }
                ]
            }
        })
    ]
});
