import { defineComponent, h, Transition } from 'vue'
import { MENU_BUFFER } from '../constants'
import { watchSize, setupResizeAndScrollEventListeners } from '../utils'
import createOptionVNode from './OptionRenderer'
import Tip from './Tip'

const directionMap = {
  top: 'top',
  bottom: 'bottom',
  above: 'top',
  below: 'bottom',
}

export default defineComponent({
  name: 'vue-treeselect--menu',
  inject: [ 'instance' ],

  computed: {
    menuStyle() {
      const { instance } = this

      return {
        maxHeight: instance.maxHeight + 'px',
      }
    },

    menuContainerStyle() {
      const { instance } = this

      return {
        zIndex: instance.appendToBody ? null : instance.zIndex,
      }
    },
  },

  watch: {
    'instance.menu.isOpen'(newValue) {
      if (newValue) {
        // In case `openMenu()` is just called and the menu is not rendered yet.
        this.$nextTick(this.onMenuOpen)
      } else {
        this.onMenuClose()
      }
    },
  },

  created() {
    this.menuSizeWatcher = null
    this.menuResizeAndScrollEventListeners = null
  },

  mounted() {
    const { instance } = this

    if (instance.menu.isOpen) this.$nextTick(this.onMenuOpen)
  },

  unmounted() {
    this.onMenuClose()
  },

  methods: {
    renderMenu() {
      const { instance } = this

      if (!instance.menu.isOpen) return null

      return h('div', {
        ref: 'menu',
        class: 'vue-treeselect__menu',
        onMousedown: instance.handleMouseDown,
        style: this.menuStyle,
      }, [
        this.renderBeforeList(),
        instance.async
          ? this.renderAsyncSearchMenuInner()
          : instance.localSearch.active
            ? this.renderLocalSearchMenuInner()
            : this.renderNormalMenuInner(),
        this.renderAfterList(),
      ])
    },

    renderBeforeList() {
      const { instance } = this
      const beforeListRenderer = instance.$slots['before-list']

      return beforeListRenderer
        ? beforeListRenderer()
        : null
    },

    renderAfterList() {
      const { instance } = this
      const afterListRenderer = instance.$slots['after-list']

      return afterListRenderer
        ? afterListRenderer()
        : null
    },

    renderNormalMenuInner() {
      const { instance } = this

      if (instance.rootOptionsStates.isLoading) {
        return this.renderLoadingOptionsTip()
      } else if (instance.rootOptionsStates.loadingError) {
        return this.renderLoadingRootOptionsErrorTip()
      } else if (instance.rootOptionsStates.isLoaded && instance.forest.normalizedOptions.length === 0) {
        return this.renderNoAvailableOptionsTip()
      } else {
        return this.renderOptionList()
      }
    },

    renderLocalSearchMenuInner() {
      const { instance } = this

      if (instance.rootOptionsStates.isLoading) {
        return this.renderLoadingOptionsTip()
      } else if (instance.rootOptionsStates.loadingError) {
        return this.renderLoadingRootOptionsErrorTip()
      } else if (instance.rootOptionsStates.isLoaded && instance.forest.normalizedOptions.length === 0) {
        return this.renderNoAvailableOptionsTip()
      } else if (instance.localSearch.noResults) {
        return this.renderNoResultsTip()
      } else {
        return this.renderOptionList()
      }
    },

    renderAsyncSearchMenuInner() {
      const { instance } = this
      const entry = instance.getRemoteSearchEntry()
      const shouldShowSearchPromptTip = instance.trigger.searchQuery === '' && !instance.defaultOptions
      const shouldShowNoResultsTip = shouldShowSearchPromptTip
        ? false
        : entry.isLoaded && entry.options.length === 0

      if (shouldShowSearchPromptTip) {
        return this.renderSearchPromptTip()
      } else if (entry.isLoading) {
        return this.renderLoadingOptionsTip()
      } else if (entry.loadingError) {
        return this.renderAsyncSearchLoadingErrorTip()
      } else if (shouldShowNoResultsTip) {
        return this.renderNoResultsTip()
      } else {
        return this.renderOptionList()
      }
    },

    renderOptionList() {
      const { instance } = this

      return h('div', { class: 'vue-treeselect__list' },
        instance.forest.normalizedOptions.map(rootNode =>
          createOptionVNode(instance, rootNode)
        )
      )
    },

    renderSearchPromptTip() {
      const { instance } = this

      return h(Tip, { type: 'search-prompt', icon: 'warning' }, () => instance.searchPromptText)
    },

    renderLoadingOptionsTip() {
      const { instance } = this

      return h(Tip, { type: 'loading', icon: 'loader' }, () => instance.loadingText)
    },

    renderLoadingRootOptionsErrorTip() {
      const { instance } = this

      return h(Tip, { type: 'error', icon: 'error' }, () => [
        instance.rootOptionsStates.loadingError,
        h('a', {
          class: 'vue-treeselect__retry',
          onClick: instance.loadRootOptions,
          title: instance.retryTitle,
        }, instance.retryText),
      ])
    },

    renderAsyncSearchLoadingErrorTip() {
      const { instance } = this
      const entry = instance.getRemoteSearchEntry()

      return h(Tip, { type: 'error', icon: 'error' }, () => [
        entry.loadingError,
        h('a', {
          class: 'vue-treeselect__retry',
          onClick: instance.handleRemoteSearch,
          title: instance.retryTitle,
        }, instance.retryText),
      ])
    },

    renderNoAvailableOptionsTip() {
      const { instance } = this

      return h(Tip, { type: 'no-options', icon: 'warning' }, () => instance.noOptionsText)
    },

    renderNoResultsTip() {
      const { instance } = this

      return h(Tip, { type: 'no-results', icon: 'warning' }, () => instance.noResultsText)
    },

    onMenuOpen() {
      this.adjustMenuOpenDirection()
      this.setupMenuSizeWatcher()
      this.setupMenuResizeAndScrollEventListeners()
    },

    onMenuClose() {
      this.removeMenuSizeWatcher()
      this.removeMenuResizeAndScrollEventListeners()
    },

    adjustMenuOpenDirection() {
      const { instance } = this
      if (!instance || !instance.menu.isOpen) return

      const $menu = instance.getMenu()
      const $control = instance.getControl()
      
      if (!$menu || !$control) return

      try {
        const menuRect = $menu.getBoundingClientRect()
        const controlRect = $control.getBoundingClientRect()
        const menuHeight = menuRect.height
        const viewportHeight = window.innerHeight
        const spaceAbove = controlRect.top
        const spaceBelow = window.innerHeight - controlRect.bottom
        const isControlInViewport = (
          (controlRect.top >= 0 && controlRect.top <= viewportHeight) ||
          (controlRect.top < 0 && controlRect.bottom > 0)
        )
        const hasEnoughSpaceBelow = spaceBelow > menuHeight + MENU_BUFFER
        const hasEnoughSpaceAbove = spaceAbove > menuHeight + MENU_BUFFER

        if (!isControlInViewport) {
          instance.closeMenu()
        } else if (instance.openDirection !== 'auto') {
          instance.menu.placement = directionMap[instance.openDirection]
        } else if (hasEnoughSpaceBelow || !hasEnoughSpaceAbove) {
          instance.menu.placement = 'bottom'
        } else {
          instance.menu.placement = 'top'
        }
      } catch (e) {
        // Ignore errors if elements are not available
      }
    },

    setupMenuSizeWatcher() {
      const { instance } = this
      const $menu = instance.getMenu()

      if (this.menuSizeWatcher || !$menu) return

      try {
        this.menuSizeWatcher = {
          remove: watchSize($menu, this.adjustMenuOpenDirection),
        }
      } catch (e) {
        // Ignore errors
      }
    },

    setupMenuResizeAndScrollEventListeners() {
      const { instance } = this
      const $control = instance.getControl()

      if (this.menuResizeAndScrollEventListeners || !$control) return

      try {
        this.menuResizeAndScrollEventListeners = {
          remove: setupResizeAndScrollEventListeners($control, this.adjustMenuOpenDirection),
        }
      } catch (e) {
        // Ignore errors
      }
    },

    removeMenuSizeWatcher() {
      if (!this.menuSizeWatcher) return

      try {
        this.menuSizeWatcher.remove()
      } catch (e) {
        // Ignore errors
      }
      this.menuSizeWatcher = null
    },

    removeMenuResizeAndScrollEventListeners() {
      if (!this.menuResizeAndScrollEventListeners) return

      try {
        this.menuResizeAndScrollEventListeners.remove()
      } catch (e) {
        // Ignore errors
      }
      this.menuResizeAndScrollEventListeners = null
    },
  },

  render() {
    const menu = this.renderMenu()
    
    return h('div', {
      ref: 'menu-container',
      class: 'vue-treeselect__menu-container',
      style: this.menuContainerStyle,
    }, [
      menu ? h(Transition, {
        name: 'vue-treeselect__menu--transition',
      }, {
        default: () => menu
      }) : null,
    ])
  },
})
