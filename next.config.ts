import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://172.20.10.3:8080/api/:path*', // 指向你的后端 API
            },
        ]
    },
    experimental: {

        // turbopack: false
        esmExternals: 'loose'
    },
    transpilePackages: [
        'antd',
        '@ant-design/pro-components',
        '@ant-design/pro-layout',
        '@ant-design/pro-table',
        '@ant-design/pro-form',
        '@ant-design/nextjs-registry',
        '@ant-design/icons',
        'rc-util',
        'rc-pagination',
        'rc-picker',
        'rc-tree',
        'rc-table',
        'rc-tooltip',
        'rc-menu',
        'rc-motion',
        'rc-field-form'
    ],
    compiler: {
        emotion: true
    },
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        config.resolve.alias = {
            ...config.resolve.alias,
        }
        config.ignoreWarnings = [
            ...(config.ignoreWarnings || []),
            {
                message: /Hydration failed/,
            },
            {
                message: /server rendered HTML didn't match/,
            }
        ];
        return config
    }
}

export default nextConfig