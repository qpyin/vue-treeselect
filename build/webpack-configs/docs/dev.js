const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const config = require('../../config')
const utils = require('../utils')
const base = require('./base')

module.exports = {
  ...base,
  mode: 'development',

  entry: {
    app: [
      utils.resolve('build/dev-client.js'),
      utils.resolve('docs/main.js'),
    ],
  },

  output: {
    ...base.output,
    publicPath: config.dev.assetsPublicPath,
    filename: '[name].js',
  },

  module: {
    ...base.module,
    rules: [
      ...(base.module && base.module.rules ? base.module.rules : []),
      utils.eslintLoader ? utils.eslintLoader('src') : null,
      utils.styleLoaders({
        sourceMap: false,
      }),
    ].filter(Boolean),
  },

  // cheap-module-eval-source-map is faster for development
  devtool: 'eval-cheap-module-source-map',

  plugins: [
    ...(base.plugins || []),
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.HotModuleReplacementPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      template: utils.resolve('docs/index.pug'),
      templateParameters: {
        NODE_ENV: 'development',
      },
    }),
    new FriendlyErrorsPlugin(),
  ],
}
