const { resolve } = require('path');
const { readdirSync } = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { HotModuleReplacementPlugin } = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const devMode = process.env.NODE_ENV !== 'production';


// 扫描js目录下的文件
const files = readdirSync(resolve(__dirname, 'src'))
let entry = {};
for (let v of files) {
    if (/(.+?)\.js$/.test(v)) {
        entry[RegExp.$1] = './src/js/' + v
    }
}
module.exports = {
    entry: entry ,//多入口
    output: {
        path: resolve(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name]-[hash].js'//输出文件添加hash
    },
    optimization: { 
        minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],//压缩css
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                common: {
                    name: 'common',
                    chunks: 'initial',
                    priority: 2,
                    minChunks: 2,
                },
                styles: {
                    name: 'styles',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true,
                    priority: 20, 
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
            {
                test: /\.html$/,
                use: 'html-loader'
            },
            {
                test: /\.pug$/,
                use: ['html-loader', 'pug-html-loader']
            },
            {
                test: /\.css$/i,
                use: [
                    {
                      loader: MiniCssExtractPlugin.loader,
                      options: {
                        hmr: devMode,
                      },
                    },
                    'css-loader',
                  ],          
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [          {
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                      hmr: devMode,
                    },
                },
                'css-loader', 'postcss-loader', 'sass-loader']
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
        new BundleAnalyzerPlugin(),//打包体积可视化分析
        new CleanWebpackPlugin(),//生成新文件时，清空生出目录
        new HtmlWebpackPlugin({
            template: './src/view/index.pug',//模版路径
            filename: 'index.html',//生成后的文件名,默认index.html
            favicon: './public/favicon.jpg',
            chunks: ['runtime','common','index'],          
            minify: {
                removeAttributeQuotes:true,
                removeComments: true,
                collapseWhitespace: true,
                removeScriptTypeAttributes:true,
                removeStyleLinkTypeAttributes:true
             }
        }),
        new HtmlWebpackPlugin({
            template: './src/view/sign.pug',//模版路径
            filename: 'sign.html',//生成后的文件名,默认index.html
            favicon: './public/favicon.jpg',
            chunks: ['runtime','common','sign'],
            minify: {
                removeAttributeQuotes:true,
                removeComments: true,
                collapseWhitespace: true,
                removeScriptTypeAttributes:true,
                removeStyleLinkTypeAttributes:true
             }
        }),
        new HtmlWebpackPlugin({
            template: './src/view/404.pug',//模版路径
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
        new MiniCssExtractPlugin({//css提取压缩配置
            filename: devMode ? '[name].css' : '[name].[hash].css',
            chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
            ignoreOrder: true,    
        }),
        new HotModuleReplacementPlugin()//HMR
    ]
};