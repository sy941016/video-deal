const webpack = require('webpack');

module.exports = {
    lintOnSave:false,
    devServer: {
        open: process.platform === 'darwin',
        disableHostCheck: true,
        host: '0.0.0.0', // 允许外部ip访问
        port: 3094, // 端口
        https: false, // 启用https
        overlay: {
            warnings: true,
            errors: true
        }, // 错误、警告在页面弹出
        proxy: {
            // /api/xxx 代理 http://www.shiyuan.cn/xxx
            '/api': {
                target: 'http://www.shiyuan.cn', // 接口的域名
                //secure:false, // 如果是https接口，需配置这个参数
                changeOrigin: true, // 如果target是域名需配置这个参数，否则会代理失败
                pathRewrite: {  // 路径重写(如果接口中是没有api的，那就直接置空)
                    '^/api': ''
                }
            }
        }
    },
    // 放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录
    assetsDir: 'assets',
    // 第三方插件配置
    pluginOptions: {},

    configureWebpack: {
        plugins: [
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                "windows.jQuery": "jquery"
            })
        ]
    },
    //是否使用包含运行时编译器的 Vue 构建版本
    runtimeCompiler: true
};
