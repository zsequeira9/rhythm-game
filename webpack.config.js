const baseManifest = require("./manifest.json");
const path = require('path');

module.exports = {
    mode: 'development',
    devtool: "cheap-module-source-map",
    entry: {
        main: path.join(__dirname, './src/main'),
        content: path.join(__dirname, './content_scripts/content'),
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
