const path = require('path');

module.exports = {
    mode: 'development',
    devtool: "cheap-module-source-map",
    entry: {
        main: path.join(__dirname, './src/main'),
        background: path.join(__dirname, './src/background'),
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader',
                ],
            },
        ],
    },
    resolve: {
        fallback: {
            fs: false,
            crypto: false,
            path: false
        },

    }


};
