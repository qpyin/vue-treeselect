import { defineComponent, h, createApp } from 'vue'
import { watchSize, setupResizeAndScrollEventListeners, find } from '../utils'
import Menu from './Menu'

const PortalTarget = {
  name: 'vue-treeselect--portal-target',
  inject: [ 'instance' ],

  watch: {
    'instance.menu.isOpen'(newValue) {
      if (newValue) {
        this.setupHandlers()
      } else {
        this.removeHandlers()
      }
    },

    'instance.menu.placement'() {
      this.updateMenuContainerOffset()
    },
  },

  created() {
    this.controlResizeAndScrollEventListeners = null
    this.controlSizeWatcher = null
  },

  mounted() {
    const { instance } = this

    if (instance.menu.isOpen) this.setupHandlers()
  },

  unmounted() {
    this.removeHandlers()
  },

  methods: {
    setupHandlers() {
      this.updateWidth()
      this.updateMenuContainerOffset()
      this.setupControlResizeAndScrollEventListeners()
      this.setupControlSizeWatcher()
    },

    removeHandlers() {
      this.removeControlResizeAndScrollEventListeners()
      this.removeControlSizeWatcher()
    },

    setupControlResizeAndScrollEventListeners() {
      const { instance } = this
      const $control = instance.getControl()

      if (this.controlResizeAndScrollEventListeners) return

      this.controlResizeAndScrollEventListeners = {
        remove: setupResizeAndScrollEventListeners($control, this.updateMenuContainerOffset),
      }
    },

    setupControlSizeWatcher() {
      const { instance } = this
      const $control = instance.getControl()

      if (this.controlSizeWatcher) return

      this.controlSizeWatcher = {
        remove: watchSize($control, () => {
          this.updateWidth()
          this.updateMenuContainerOffset()
        }),
      }
    },

    removeControlResizeAndScrollEventListeners() {
      if (!this.controlResizeAndScrollEventListeners) return

      this.controlResizeAndScrollEventListeners.remove()
      this.controlResizeAndScrollEventListeners = null
    },

    removeControlSizeWatcher() {
      if (!this.controlSizeWatcher) return

      this.controlSizeWatcher.remove()
      this.controlSizeWatcher = null
    },

    updateWidth() {
      const { instance } = this
      const $portalTarget = this.$el
      const $control = instance.getControl()
      const controlRect = $control.getBoundingClientRect()

      $portalTarget.style.width = controlRect.width + 'px'
    },

    updateMenuContainerOffset() {
      const { instance } = this
      const $control = instance.getControl()
      const $portalTarget = this.$el
      const controlRect = $control.getBoundingClientRect()
      const portalTargetRect = $portalTarget.getBoundingClientRect()
      const offsetY = instance.menu.placement === 'bottom' ? controlRect.height : 0
      const left = Math.round(controlRect.left - portalTargetRect.left) + 'px'
      const top = Math.round(controlRect.top - portalTargetRect.top + offsetY) + 'px'
      const menuContainerStyle = this.$refs.menu.$refs['menu-container'].style
      const transformVariations = [ 'transform', 'webkitTransform', 'MozTransform', 'msTransform' ]
      const transform = find(transformVariations, t => t in document.body.style)

      // IE9 doesn't support `translate3d()`.
      menuContainerStyle[transform] = `translate(${left}, ${top})`
    },
  },

  render() {
    const { instance } = this
    const portalTargetClass = [ 'vue-treeselect__portal-target', instance.wrapperClass ]
    const portalTargetStyle = { zIndex: instance.zIndex }

    return h('div', {
      class: portalTargetClass,
      style: portalTargetStyle,
      'data-instance-id': instance.getInstanceId(),
    }, [
      h(Menu, { ref: 'menu' }),
    ])
  },
}

let placeholder

export default defineComponent({
  name: 'vue-treeselect--menu-portal',

  created() {
    this.portalTarget = null
    this.portalApp = null
  },

  mounted() {
    this.setup()
  },

  unmounted() {
    this.teardown()
  },

  methods: {
    setup() {
      const el = document.createElement('div')
      document.body.appendChild(el)

      this.portalApp = createApp({
        parent: this,
        ...PortalTarget,
      })
      this.portalApp.provide('instance', this.instance)
      this.portalTarget = this.portalApp.mount(el)
    },

    teardown() {
      if (this.portalApp) {
        this.portalApp.unmount()
        this.portalApp = null
      }
      this.portalTarget = null
    },
  },

  render() {
    if (!placeholder) placeholder = h('div', { class: 'vue-treeselect__menu-placeholder' })

    return placeholder
  },
})
