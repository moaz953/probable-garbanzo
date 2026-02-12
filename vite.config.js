import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['vite.svg', 'robots.txt'],
            manifest: {
                name: 'AR-KEY - كيبورد عربي ذكي',
                short_name: 'AR-KEY',
                description: 'لوحة مفاتيح عربية احترافية مع تشكيل ذكي واقتراحات نصية',
                theme_color: '#6366f1',
                background_color: '#0f0f1a',
                display: 'standalone',
                orientation: 'any',
                start_url: '/',
                scope: '/',
                lang: 'ar',
                dir: 'rtl',
                categories: ['utilities', 'productivity'],
                icons: [
                    {
                        src: 'vite.svg',
                        sizes: '192x192',
                        type: 'image/svg+xml',
                        purpose: 'any maskable'
                    },
                    {
                        src: 'vite.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml',
                        purpose: 'any maskable'
                    }
                ],
                shortcuts: [
                    {
                        name: 'كتابة جديدة',
                        short_name: 'جديد',
                        url: '/',
                        icons: [{ src: 'vite.svg', sizes: '96x96' }]
                    }
                ]
            }
        })
    ]
});
