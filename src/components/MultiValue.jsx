import { defineComponent, h, TransitionGroup } from 'vue'
import MultiValueItem from './MultiValueItem'
import Input from './Input'
import Placeholder from './Placeholder'

export default defineComponent({
  name: 'vue-treeselect--multi-value',
  inject: [ 'instance' ],

  methods: {
    renderMultiValueItems() {
      const { instance } = this

      return instance.internalValue
        .slice(0, instance.limit)
        .map(instance.getNode)
        .map(node => h(MultiValueItem, { key: `multi-value-item-${node.id}`, node }))
    },

    renderExceedLimitTip() {
      const { instance } = this
      const count = instance.internalValue.length - instance.limit

      if (count <= 0) return null

      return h('div', {
        key: 'exceed-limit-tip',
        class: 'vue-treeselect__limit-tip vue-treeselect-helper-zoom-effect-off',
      }, [
        h('span', { class: 'vue-treeselect__limit-tip-text' }, instance.limitText(count)),
      ])
    },
  },

  render() {
    const { renderValueContainer } = this.$parent

    return renderValueContainer(
      h(TransitionGroup, {
        class: 'vue-treeselect__multi-value',
        tag: 'div',
        name: 'vue-treeselect__multi-value-item--transition',
        appear: true,
        css: true,
      }, {
        default: () => [
          this.renderMultiValueItems(),
          this.renderExceedLimitTip(),
          h(Placeholder, { key: 'placeholder' }),
          h(Input, { ref: 'input', key: 'input' }),
        ]
      })
    )
  },
})
