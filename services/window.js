import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import uuid from 'uuid'

const DRAWER_RIGHT_PADDING = 56
// DRAWER_MAX_WIDTH = 336
const DRAWER_MAX_WIDTH = 72
const GRID_WIDTH = 1280

export default class Window {
  constructor ({ cookie, userAgent }) {
    this.cookie = cookie
    this.userAgent = userAgent
    this.isPaused = false

    this.size = new Rx.BehaviorSubject(this.getSizeVal())
    this.breakpoint = new Rx.BehaviorSubject(this.getBreakpointVal())
    this.drawerWidth = new Rx.BehaviorSubject(this.getDrawerWidthVal())
    this.appBarHeight = new Rx.BehaviorSubject(this.getAppBarHeightVal())
    this.resumeFns = {}
    globalThis?.window?.addEventListener('resize', this.updateSize)
  }

  updateSize = (ignoreBreakpoint) => {
    const oldSize = this.size.getValue()
    const newSize = this.getSizeVal()
    const oldBreakpoint = this.breakpoint.getValue()
    const newBreakpoint = this.getBreakpointVal()
    // don't want to update if not necessary. particularly because there can be
    // breakpoint-specific routes in app.js, and those listen to @breakpoint
    if (!this.isPaused) {
      if (oldSize !== newSize) {
        this.size.next(newSize)
      }
      if (oldBreakpoint !== newBreakpoint) {
        this.breakpoint.next(newBreakpoint)
      }
    }
  }

  getSizeVal = () => {
    let height, width
    const resolution = this.cookie.get('resolution')
    if (typeof window !== 'undefined') {
      // WARNING: causes reflows, so don't call this too often
      width = window.innerWidth
      height = window.innerHeight
      this.cookie.set('resolution', `${width}x${height}`)
    } else if (resolution) {
      const arr = resolution.split('x')
      width = parseInt(arr[0])
      height = parseInt(arr[1])
    } else {
      width = undefined
      height = 732
    }

    return {
      contentWidth:
        width >= 768
          ? Math.min(GRID_WIDTH, width - DRAWER_MAX_WIDTH)
          : width,
      width,
      height,
      appBarHeight: width >= 768 ? 64 : 56
    }
  }

  getBreakpointVal = () => {
    const { width } = this.getSizeVal()
    if (width >= 1280) {
      return 'desktop'
    } else if (width >= 768) {
      return 'tablet'
    } else {
      return 'mobile'
    }
  }

  getDrawerWidthVal = () => {
    const { width } = this.getSizeVal()
    return Math.min(
      width - DRAWER_RIGHT_PADDING,
      DRAWER_MAX_WIDTH
    )
  }

  getAppBarHeightVal = () => {
    const { width } = this.getSizeVal()
    if (width >= 768) { return 64 } else { return 56 }
  }

  getUserAgent = () => {
    return this.userAgent
  }

  getSize = () => {
    return this.size
  }

  getDrawerWidth = () => {
    return this.drawerWidth
  }

  getBreakpoint = () => {
    return this.breakpoint
  }

  getAppBarHeight = () => {
    return this.appBarHeight
  }

  getTransformProperty = () => {
    if (typeof window !== 'undefined') {
      const _elementStyle = document.createElement('div').style
      const _vendor = (() => {
        const vendors = [
          't',
          'webkitT',
          'MozT',
          'msT',
          'OT'
        ]
        let transform
        let i = 0
        const l = vendors.length
        while (i < l) {
          transform = vendors[i] + 'ransform'
          if (transform in _elementStyle) {
            return vendors[i].substr(0, vendors[i].length - 1)
          }
          i += 1
        }
        return false
      })()

      const _prefixStyle = (style) => {
        if (_vendor === false) {
          return false
        }
        if (_vendor === '') {
          return style
        }
        return _vendor + style.charAt(0).toUpperCase() + style.substr(1)
      }

      return _prefixStyle('transform')
    } else {
      return 'transform' // should probably use userAgent to get more accurate
    }
  }

  pauseResizing = () => {
    this.isPaused = true
  }

  resumeResizing = () => {
    this.isPaused = false
    this.updateSize()
  }

  resume = () => {
    _.forEach(this.resumeFns, fn => fn())
  }

  onResume = (fn) => {
    const id = uuid.v4()
    this.resumeFns[id] = fn
    return {
      unsubscribe: () => {
        delete this.resumeFns[id]
      }
    }
  }
}
