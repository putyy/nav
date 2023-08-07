const path = require('path')
import { defineConfig } from 'vite'

export default defineConfig({
    root: path.resolve(__dirname, 'src'),
    server: {
        port: 8899,
        hot: true
    },
    build: {
        outDir: path.resolve(__dirname, 'dist'), // 打包文件的输出目录
        assetsDir: 'assets', // 静态资源的存放目录
        assetsInlineLimit: 0,
    },
    alias: {
        '@': path.resolve(__dirname, 'src') // 路径别名
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `` // 全局变量
            }
        }
    }
})