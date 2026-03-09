const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  context: path.join(__dirname, 'src'),
  mode: 'development',
  devtool: 'source-map',
  target: 'web',
  entry: {
    index: './index.ts',
    play: './play.ts',
    edit: './edit.ts',
    test: './test.ts'
  },
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
    fallback: {
      path: false,
      fs: false,
      child_process: false,
      crypto: false,
      url: false,
      module: false,
    },
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
      {
        test: /\.js$/,
        loader: "source-map-loader"
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|wasm)$/i,
        type: 'asset/resource',
      },
      {
        resourceQuery: /raw/,
        type: 'asset/source',
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {from: "copy"}
      ]
    }),
    new MiniCssExtractPlugin({
      filename: "[contenthash].css",
    }),
    new HtmlWebpackPlugin({
      chunks: ["index"],
      template: 'index.html',
      favicon: 'favicon.png',
    }),
    new HtmlWebpackPlugin({
      chunks: ["play"],
      template: 'engine.html',
      templateParameters: {
        isEditor: false,
      },
      filename: 'play.html',
      favicon: 'favicon.png',
    }),
    new HtmlWebpackPlugin({
      chunks: ["edit"],
      template: 'engine.html',
      templateParameters: {
        isEditor: true,
      },
      filename: 'edit.html',
      favicon: 'favicon.png',
    }),
    new HtmlWebpackPlugin({
      chunks: ["test"],
      template: 'test.html',
      filename: 'test.html',
      favicon: 'favicon.png',
    }),
    new WorkboxPlugin.GenerateSW({
       // these options encourage the ServiceWorkers to get in there fast
       // and not allow any straggling "old" SWs to hang around
       clientsClaim: true,
       skipWaiting: true
    })
  ]
};