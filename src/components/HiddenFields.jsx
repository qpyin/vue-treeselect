import { defineComponent, h } from 'vue'
import { isNaN } from '../utils'

function stringifyValue(value) {
  if (typeof value === 'string') return value
  if (value != null && !isNaN(value)) return JSON.stringify(value)
  return ''
}

export default defineComponent({
  name: 'vue-treeselect--hidden-fields',
  inject: [ 'instance' ],

  render() {
    const { instance } = this

    if (!instance.name || instance.disabled || !instance.hasValue) return null

    let stringifiedValues = instance.internalValue.map(stringifyValue)

    if (instance.multiple && instance.joinValues) {
      stringifiedValues = [ stringifiedValues.join(instance.delimiter) ]
    }

    return stringifiedValues.map((stringifiedValue, i) =>
      h('input', {
        type: 'hidden',
        name: instance.name,
        value: stringifiedValue,
        key: 'hidden-field-' + i,
      })
    )
  },
})
