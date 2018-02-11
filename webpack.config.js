var path = require("path");
var webpack = require("webpack");

module.exports = {
  entry: path.resolve(__dirname, "./"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "waveshaper.bundle.js",
    publicPath: "/"
  },
  devtool: 'source-map'
};
