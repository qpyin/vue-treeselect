const config = require('../../config')
const base = require('../base')

module.exports = { ...base,
  output: {
    path: config.docs.assetsRoot,
  },
}
