const { defineConfig } = require('@vue/cli-service');
const address = require('address');
const localhost = address.ip() || 'localhost';

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  publicPath:'/',
  
  devServer: {
    // 自动打开浏览器
    // host: '192.168.147.9',
    port: 8888,
    // open: true,
    
    //代理跨域
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  },
})
