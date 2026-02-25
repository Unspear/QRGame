const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  target: 'web',
  entry: {
    index: './src/index.ts',
    play: './src/play.ts',
    edit: './src/edit.ts',
    test: './src/test.ts'
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
    new MiniCssExtractPlugin({
      filename: "[contenthash].css",
    }),
    new HtmlWebpackPlugin({
      chunks: ["index"],
      template: 'src/index.html',
      favicon: 'src/icon-16.png',
    }),
    new HtmlWebpackPlugin({
      chunks: ["play"],
      template: 'src/engine.html',
      templateParameters: {
        isEditor: false,
      },
      filename: 'play.html',
      favicon: 'src/icon-16.png',
    }),
    new HtmlWebpackPlugin({
      chunks: ["edit"],
      template: 'src/engine.html',
      templateParameters: {
        isEditor: true,
      },
      filename: 'edit.html',
      favicon: 'src/icon-16.png',
    }),
    new HtmlWebpackPlugin({
      chunks: ["test"],
      template: 'src/test.html',
      filename: 'test.html',
      favicon: 'src/icon-16.png',
    }),
    new WorkboxPlugin.GenerateSW({
       // these options encourage the ServiceWorkers to get in there fast
       // and not allow any straggling "old" SWs to hang around
       clientsClaim: true,
       skipWaiting: true
     }),
    new WebpackPwaManifest({
      name: 'QR Game',
      short_name: 'QR Game',
      description: 'Description!',
      background_color: '#ffffff',
      publicPath: './',
      icons: [
        {
          src: path.resolve('src/icon-16.png'),
          size: 16,
        },
        {
          src: path.resolve('src/icon-192.png'),
          size: 192,
        },
        {
          src: path.resolve('src/icon-512.png'),
          size: 512,
        }
      ]
    })
  ]
};