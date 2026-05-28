import { defineComponent, h } from 'vue'
import { onLeftClick, isPromise } from '../utils'
import SingleValue from './SingleValue'
import MultiValue from './MultiValue'
import DeleteIcon from './icons/Delete'
import ArrowIcon from './icons/Arrow'

export default defineComponent({
  name: 'vue-treeselect--control',
  inject: [ 'instance' ],

  computed: {
    shouldShowX() {
      const { instance } = this

      return (
        instance.clearable &&
        !instance.disabled &&
        instance.hasValue &&
        (this.hasUndisabledValue || instance.allowClearingDisabled)
      )
    },

    shouldShowArrow() {
      const { instance } = this

      if (!instance.alwaysOpen) return true
      return !instance.menu.isOpen
    },

    hasUndisabledValue() {
      const { instance } = this

      return (
        instance.hasValue &&
        instance.internalValue.some(id => !instance.getNode(id).isDisabled)
      )
    },
  },

  methods: {
    renderX() {
      const { instance } = this
      const title = instance.multiple ? instance.clearAllText : instance.clearValueText

      if (!this.shouldShowX) return null

      return h('div', {
        class: 'vue-treeselect__x-container',
        title,
        onMousedown: this.handleMouseDownOnX,
      }, [
        h(DeleteIcon, { class: 'vue-treeselect__x' }),
      ])
    },

    renderArrow() {
      const { instance } = this
      const arrowClass = {
        'vue-treeselect__control-arrow': true,
        'vue-treeselect__control-arrow--rotated': instance.menu.isOpen,
      }

      if (!this.shouldShowArrow) return null

      return h('div', {
        class: 'vue-treeselect__control-arrow-container',
        onMousedown: this.handleMouseDownOnArrow,
      }, [
        h(ArrowIcon, { class: arrowClass }),
      ])
    },

    handleMouseDownOnX: onLeftClick(function handleMouseDownOnX(evt) {
      evt.stopPropagation()
      evt.preventDefault()

      const { instance } = this
      const result = instance.beforeClearAll()
      const handler = shouldClear => {
        if (shouldClear) instance.clear()
      }

      if (isPromise(result)) {
        result.then(handler)
      } else {
        setTimeout(() => handler(result), 0)
      }
    }),

    handleMouseDownOnArrow: onLeftClick(function handleMouseDownOnArrow(evt) {
      evt.preventDefault()
      evt.stopPropagation()

      const { instance } = this

      instance.focusInput()
      instance.toggleMenu()
    }),

    renderValueContainer(children) {
      return h('div', { class: 'vue-treeselect__value-container' }, children)
    },
  },

  render() {
    const { instance } = this
    const ValueContainer = instance.single ? SingleValue : MultiValue

    return h('div', {
      class: 'vue-treeselect__control',
      onMousedown: instance.handleMouseDown,
    }, [
      h(ValueContainer, { ref: 'value-container' }),
      this.renderX(),
      this.renderArrow(),
    ])
  },
})
