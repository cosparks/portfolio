const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
    name: "webpack-three",
    mode: "development",
    entry: {
      app: ["./src/index.js"],
    },
    output: {
      path: path.join(__dirname, "dist"),
      filename: "bundle.js",
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    plugins: [
        new HtmlWebpackPlugin({
          filename: path.resolve(__dirname, "dist", "index.html"),
          template: "./src/index.html",
          hash: true,
        }),
        new CopyPlugin({
          patterns: [
            { from: "src/assets/", to: "assets/" },
            { from: "src/style.css", to: "./" },
            { from: "src/shaders.html", to: "./" },
          ],
          options: {
            concurrency: 100,
          },
        }),
    ],      
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        host: "0.0.0.0", // Open every network Access.
        compress: true,
        port: 9000
    }
}