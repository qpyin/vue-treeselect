import { h, Transition } from 'vue'
import { UNCHECKED, INDETERMINATE, CHECKED } from '../constants'
import ArrowIcon from './icons/Arrow'

let arrowPlaceholder, checkMark, minusMark

// Safe getter for nested properties
function safeGet(obj, path, defaultValue = null) {
  try {
    const keys = path.split('.')
    let result = obj
    for (const key of keys) {
      if (result == null) return defaultValue
      result = result[key]
    }
    return result !== undefined ? result : defaultValue
  } catch (e) {
    return defaultValue
  }
}

// Event handlers
function handleMouseEnterOption(evt, instance, node) {
  if (evt.target !== evt.currentTarget) return
  try {
    if (instance && instance.setCurrentHighlightedOption) {
      instance.setCurrentHighlightedOption(node, false)
    }
  } catch (e) {
  }
}

function handleMouseDownOnArrow(evt, instance, node) {
  evt.preventDefault()
  evt.stopPropagation()
  try {
    if (instance && instance.toggleExpanded) {
      instance.toggleExpanded(node)
    }
  } catch (e) {
  }
}

function handleMouseDownOnLabelContainer(evt, instance, node, disableBranchNodes) {
  evt.preventDefault()
  evt.stopPropagation()
  try {
    if (!instance) return
    if (node.isBranch && disableBranchNodes) {
      instance.toggleExpanded(node)
    } else if (instance.select) {
      instance.select(node)
    }
  } catch (e) {
  }
}

// This is a helper function that creates option vnodes
export default function createOptionVNode(instance, node) {
  try {
    if (!instance || !node) {
      return h('div', { class: 'vue-treeselect__list-item' }, 'Invalid option')
    }

    const shouldExpand = node.isBranch && instance.shouldExpand(node)
    const shouldShow = instance.shouldShowOptionInMenu(node)

    const optionClass = {
      'vue-treeselect__option': true,
      'vue-treeselect__option--disabled': !!node.isDisabled,
      'vue-treeselect__option--selected': instance.isSelected ? instance.isSelected(node) : false,
      'vue-treeselect__option--highlight': !!node.isHighlighted,
      'vue-treeselect__option--matched': !!(instance.localSearch && instance.localSearch.active && node.isMatched),
      'vue-treeselect__option--hide': !shouldShow,
    }

    // Arrow rendering
    let arrowVNode = null
    const shouldFlatten = instance.shouldFlattenOptions
    if (!shouldFlatten || !shouldShow) {
      if (node.isBranch) {
        const arrowClass = {
          'vue-treeselect__option-arrow': true,
          'vue-treeselect__option-arrow--rotated': !!shouldExpand,
        }
        arrowVNode = h('div', {
          class: 'vue-treeselect__option-arrow-container',
          onMousedown: evt => handleMouseDownOnArrow(evt, instance, node),
        }, h(ArrowIcon, { class: arrowClass }))
      } else if (instance.hasBranchNodes) {
        if (!arrowPlaceholder) arrowPlaceholder = h('div', { class: 'vue-treeselect__option-arrow-placeholder' }, '\u00A0')
        arrowVNode = arrowPlaceholder
      }
    }

    // Checkbox
    let checkboxVNode = null
    const isSingle = instance.single
    const disableBranchNodes = instance.disableBranchNodes
    if (!isSingle && !(disableBranchNodes && node.isBranch)) {
      const checkedState = safeGet(instance, 'forest.checkedStateMap.' + node.id, UNCHECKED)
      const checkboxClass = {
        'vue-treeselect__checkbox': true,
        'vue-treeselect__checkbox--checked': checkedState === CHECKED,
        'vue-treeselect__checkbox--indeterminate': checkedState === INDETERMINATE,
        'vue-treeselect__checkbox--unchecked': checkedState === UNCHECKED,
        'vue-treeselect__checkbox--disabled': !!node.isDisabled,
      }
      if (!checkMark) checkMark = h('span', { class: 'vue-treeselect__check-mark' })
      if (!minusMark) minusMark = h('span', { class: 'vue-treeselect__minus-mark' })
      checkboxVNode = h('div', { class: 'vue-treeselect__checkbox-container' }, h('span', { class: checkboxClass }, [ checkMark, minusMark ]),
      )
    }

    // Label
    const shouldShowCount = node.isBranch && (
      safeGet(instance, 'localSearch.active', false) ?
        safeGet(instance, 'showCountOnSearchComputed', false) :
        safeGet(instance, 'showCount', false)
    )
    let count = NaN
    if (shouldShowCount && node.isBranch) {
      try {
        if (safeGet(instance, 'localSearch.active', false)) {
          count = safeGet(instance, 'localSearch.countMap.' + node.id + '.' + instance.showCountOf, NaN)
        } else {
          count = safeGet(node, 'count.' + safeGet(instance, 'showCountOf', 'all'), NaN)
        }
      } catch (e) {
        count = NaN
      }
    }

    const customLabelRenderer = safeGet(instance, '$slots.option-label', null)
    let labelVNode
    if (typeof customLabelRenderer === 'function') {
      labelVNode = customLabelRenderer({
        node,
        shouldShowCount,
        count,
        labelClassName: 'vue-treeselect__label',
        countClassName: 'vue-treeselect__count',
      })
    } else {
      labelVNode = h('label', { class: 'vue-treeselect__label' }, [
        node.label || '',
        shouldShowCount && !isNaN(count) ? h('span', { class: 'vue-treeselect__count' }, `(${count})`) : null,
      ])
    }

    const optionVNode = h('div', {
      'class': optionClass,
      'data-id': node.id,
      'onMouseenter': evt => handleMouseEnterOption(evt, instance, node),
    }, [
      arrowVNode,
      h('div', {
        class: 'vue-treeselect__label-container',
        onMousedown: evt => handleMouseDownOnLabelContainer(evt, instance, node, disableBranchNodes),
      }, [ checkboxVNode, labelVNode ]),
    ])

    // Build children array for sub options
    const children = [ optionVNode ]

    // Sub options - only render if there are actual children
    if (node.isBranch && shouldExpand && node.children && node.children.length > 0) {
      const childrenStates = node.childrenStates
      if (childrenStates && childrenStates.isLoaded) {
        const subChildren = node.children.map(childNode =>
          createOptionVNode(instance, childNode),
        )

        const subOptionsList = h('div', { class: 'vue-treeselect__list' }, subChildren)
        children.push(h(Transition, { name: 'vue-treeselect__list--transition' }, { default: () => subOptionsList }))
      }
    }

    const indentLevel = instance.shouldFlattenOptions ? 0 : (node.level || 0)
    const listItemClass = {
      'vue-treeselect__list-item': true,
      [`vue-treeselect__indent-level-${indentLevel}`]: true,
    }

    return h('div', { class: listItemClass }, children)
  } catch (e) {
    // Return a fallback vnode if rendering fails
    return h('div', { class: 'vue-treeselect__list-item vue-treeselect__option vue-treeselect__option--error' }, node && node.label ? node.label : 'Error rendering option',
    )
  }
}
