const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  target: 'web',
  entry: {
    index: './src/index.js',
    play: './src/play.js',
    edit: './src/edit.js'
  },
  resolve: {
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
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(json)$/i,
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]',
        },
      },
      {
        resourceQuery: /raw/,
        type: 'asset/source',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ["index"],
      template: 'src/index.html',
      favicon: 'src/icon.png',
    }),
    new HtmlWebpackPlugin({
      chunks: ["play"],
      template: 'src/engine.html',
      templateParameters: {
        isEditor: false,
      },
      filename: 'play.html',
      favicon: 'src/icon.png',
    }),
    new HtmlWebpackPlugin({
      chunks: ["edit"],
      template: 'src/engine.html',
      templateParameters: {
        isEditor: true,
      },
      filename: 'edit.html',
      favicon: 'src/icon.png',
    }),
    new WorkboxPlugin.GenerateSW({
       // these options encourage the ServiceWorkers to get in there fast
       // and not allow any straggling "old" SWs to hang around
       clientsClaim: true,
       skipWaiting: true
     }),
  ]
};