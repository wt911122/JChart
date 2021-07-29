const path = require('path');
module.exports = {
    mode: 'production',
    entry: path.resolve(__dirname, './src/index.js'),
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "jchart.js",
        library: 'jchart',
        libraryTarget: 'umd',
        auxiliaryComment: {
            root: 'Root Comment',
            commonjs: 'CommonJS Comment',
            commonjs2: 'CommonJS2 Comment',
            amd: 'AMD Comment',
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
};
