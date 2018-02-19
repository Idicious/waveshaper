var path = require("path");
var webpack = require("webpack");

module.exports = {
  entry: path.join(__dirname, "src"),
  externals: {
    hammerjs : {
      root: "Hammer",
      commonjs2: "hammerjs",
      commonjs: "hammerjs",
      amd: "hammerjs",
      umd: "hammerjs"
    }
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "waveshaper.js",
    library: 'WaveShaper',
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
    extensions: [ '.ts', '.js' ]
  }
};
