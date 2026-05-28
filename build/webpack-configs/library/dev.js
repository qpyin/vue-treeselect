const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { libraryTargetPlaceholder } = require('../../config').library
const utils = require('../utils')

const IS_ENABLE_SOURCE_MAP = true

module.exports = webpackConfig => ({
  ...webpackConfig,
  mode: 'none',

  output: {
    ...webpackConfig.output,
    filename: `vue-treeselect.${libraryTargetPlaceholder}.js`,
  },

  module: {
    ...webpackConfig.module,
    rules: [
      ...(webpackConfig.module ? webpackConfig.module.rules || [] : []),
      utils.styleLoaders({
        sourceMap: IS_ENABLE_SOURCE_MAP,
        extract: true,
      }),
    ],
  },

  devtool: IS_ENABLE_SOURCE_MAP ? 'source-map' : false,

  plugins: [
    ...(webpackConfig.plugins || []),
    new MiniCssExtractPlugin({
      filename: 'vue-treeselect.css',
      chunkFilename: '[id].css',
    }),
  ],

  optimization: {
    ...webpackConfig.optimization,
    flagIncludedChunks: true,
  },
})
