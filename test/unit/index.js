import { createApp } from 'vue'

const app = createApp({})
app.config.productionTip = false
app.config.devtools = false

function importAll(r) {
  r.keys().forEach(r)
}

importAll(require.context('./specs', true, /\.spec$/))
importAll(require.context('../../src', true))
