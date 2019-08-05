const { resolve } = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { HotModuleReplacementPlugin } = require('webpack')
const { readdirSync } = require('fs')

// 扫描js目录下的文件
const files = readdirSync(resolve(__dirname, 'src'))
let entry = {};
for (let v of files) {
    if (/(.+?)\.js$/.test(v)) {
        entry[RegExp.$1] = './src/' + v
    }
}
module.exports = {
    entry: entry ,//多入口
    output: {
        path: resolve(__dirname, 'dist'),
        // publicPath: '/public/',//虚拟目录
        filename: '[name]-[hash].js'//输出文件添加hash
    },
    optimization: { // 代替commonchunk, 代码分割
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                use: ['babel-loader']//'eslint-loader'
            },
            {   /*
                使用 html-loader, 将 html 内容存为 js 字符串，比如当遇到
                import htmlString from './template.html';
                template.html 的文件内容会被转成一个 js 字符串，合并到 js 文件里。
                */
                test: /\.html$/,
                use: 'html-loader'
            },
            {
                test: /\.pug$/,
                use: ['html-loader', 'pug-html-loader']
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
            },
            {   /* 
                当文件体积小于 limit 时，url-loader 把文件转为 Data URI 的格式内联到引用的地方
                当文件大于 limit 时，url-loader 会调用 file-loader, 把文件储存到输出目录，并把引用的文件路径改写成输出后的路径 
                */
                test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 1000
                    }
                }]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: ['dist']
        }),//生成新文件时，清空生出目录
        new HtmlWebpackPlugin({
            template: './public/view/index.pug',//模版路径
            filename: 'index.html',//生成后的文件名,默认index.html
            favicon: './public/favicon.jpg',
            chunks: ['runtime','vendors','index'],          
            minify: {
                removeAttributeQuotes:true,
                removeComments: true,
                collapseWhitespace: true,
                removeScriptTypeAttributes:true,
                removeStyleLinkTypeAttributes:true
             }
        }),
        new HtmlWebpackPlugin({
            template: './public/view/sign.pug',//模版路径
            filename: 'sign.html',//生成后的文件名,默认index.html
            favicon: './public/favicon.jpg',
            chunks: ['runtime','vendors','sign'],
            minify: {
                removeAttributeQuotes:true,
                removeComments: true,
                collapseWhitespace: true,
                removeScriptTypeAttributes:true,
                removeStyleLinkTypeAttributes:true
             }
        }),
        new HtmlWebpackPlugin({
            template: './public/view/404.pug',//模版路径
            filename: '404.html',//生成后的文件名,默认index.html
            favicon: './public/favicon.jpg',
            chunks: [],
            minify: {
                removeAttributeQuotes:true,
                removeComments: true,
                collapseWhitespace: true,
                removeScriptTypeAttributes:true,
                removeStyleLinkTypeAttributes:true
             }
        }),
        new HotModuleReplacementPlugin()//HMR
    ]
};