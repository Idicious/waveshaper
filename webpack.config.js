var path = require("path");
var webpack = require("webpack");

module.exports = {
  entry: path.resolve(__dirname, "./"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    publicPath: "/"
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ]
  }
};
