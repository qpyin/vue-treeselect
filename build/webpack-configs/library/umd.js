const { libraryTargetPlaceholder } = require('../../config').library

module.exports = webpackConfig => ({
  ...webpackConfig,
  output: {
    ...webpackConfig.output,
    filename: webpackConfig.output.filename.replace(libraryTargetPlaceholder, 'umd'),
    libraryTarget: 'umd',
  },

  externals: {
    vue: 'Vue',
  },
})
