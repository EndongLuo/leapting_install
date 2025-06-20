const { defineConfig } = require('@vue/cli-service');
const address = require('address');
const localhost = address.ip() || 'localhost';

module.exports = defineConfig({
  transpileDependencies: true,
  filenameHashing: false,
  lintOnSave: false,
  publicPath:'/',
  outputDir: '../dist',
  devServer: {
    host: localhost,
    port: 8888,
    open: true,
  },
  
  devServer: {
    // 自动打开浏览器
    // host: '192.168.147.9',
    port: 8888,
    // open: true,

    //代理跨域
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        // changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true
      },
    },
  },
})
