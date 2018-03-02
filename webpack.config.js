var path = require("path");
var webpack = require("webpack");

module.exports = {
  entry: path.join(__dirname, "src"),
  output: {
    path: path.join(__dirname, "dist"),
    filename: "waveshaper.js",
    library: 'waveshaper',
    libraryTarget: 'umd',
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
    extensions: [ '.ts' ]
  }
};
