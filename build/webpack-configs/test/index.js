const utils = require('../utils')
const baseWebpackConfig = require('../base')

process.env.NODE_ENV = 'testing'

module.exports = {
  ...baseWebpackConfig,
  mode: 'development',

  module: {
    ...baseWebpackConfig.module,
    rules: [
      ...(baseWebpackConfig.module && baseWebpackConfig.module.rules ? baseWebpackConfig.module.rules : []),
      utils.styleLoaders(),
    ].filter(Boolean),
  },

  devtool: false,

  optimization: {
    ...baseWebpackConfig.optimization,
    nodeEnv: process.env.NODE_ENV,
  },
}
