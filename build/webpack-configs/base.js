const webpack = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const utils = require('./utils')

module.exports = {
  // resets the default mode
  mode: 'none',

  resolve: {
    extensions: [ '.js', '.json', '.vue', '.jsx' ],
    alias: {
      // use the full development build of Vue
      'vue$': 'vue/dist/vue.esm-bundler.js',
      // for consistent docs
      '@riophae/vue-treeselect': utils.resolve('src'),
      // for shorter import path in tests
      '@src': utils.resolve('src'),
    },
  },

  module: {
    rules: [
      utils.withCacheLoader({
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            preserveWhitespace: false,
          },
        },
      }),
      utils.withCacheLoader({
        test: /\.jsx$/,
        loader: 'babel-loader',
        include: [ 'src', 'docs', 'test' ].map(utils.resolve),
      }),
      utils.withCacheLoader({
        test: /\.js$/,
        loader: 'babel-loader',
        include: [ 'src', 'docs', 'test' ].map(utils.resolve),
      }),
      utils.withCacheLoader({
        test: /\.pug$/,
        loader: 'pug-loader',
        options: {
          pretty: true,
        },
      }),
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10000,
          },
        },
      },
    ],
  },

  optimization: {
    concatenateModules: true,
    emitOnErrors: false,
  },

  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      PKG_VERSION: JSON.stringify(require('../../package').version),
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
    }),
  ],
}
