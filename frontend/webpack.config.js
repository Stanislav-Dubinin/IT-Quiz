const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: 'development',
    entry: './src/app.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, './dist'),
        clean: true,
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: "./index.html"
        }),
        new CopyPlugin({
            patterns: [
                {from: "templates", to: "templates"},
                {from: "styles", to: "styles"},
                {from: "static/fonts", to: "fonts"},
                {from: "static/images", to: "images"},
            ],
        }),
    ],

    devServer: {
        static: '.dist',
        compress: true,
        port: 9000,
    },
};