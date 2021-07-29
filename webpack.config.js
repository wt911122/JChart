const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
module.exports = {
    mode: 'production',
    entry: path.resolve(__dirname, './src/index.js'),
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "jchart.js",
        library: 'jchart',
        libraryTarget: 'umd',
        auxiliaryComment: {
            root: 'Root jchart',
            commonjs: 'CommonJS jchart',
            commonjs2: 'CommonJS2 jchart',
            amd: 'AMD jchart',
        },
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        'plugins': ['lodash'],
                        presets: ['@babel/preset-env'],
                    }
                }
            }
        ]
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true
                    }
                }
            })
        ]
    }
};
