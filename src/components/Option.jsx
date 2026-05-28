import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'vue-treeselect--option',
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  render() {
    return h('div', { class: 'vue-treeselect__option', 'data-id': this.node.id })
  },
})
