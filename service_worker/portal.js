import PortalGun from 'portal-gun'

export default class Portal {
  constructor ({ cache }) {
    this.cache = cache
    this.portal = new PortalGun()

    // TODO: set fn for all clients. need to update portal-gun to handle
    // responding to all clients better
    this.onPushFn = null
    this.contextId = null
  }

  listen = () => {
    this.portal.listen()
    this.portal.on('top.onData', this.topOnData)
    this.portal.on('push.setContextId', this.pushSetContextId)
    this.portal.on('cache.deleteHtmlCache', this.deleteHtmlCache)
    this.portal.on('cache.startRecording', this.startRecording)
    this.portal.on('cache.stopRecording', this.stopRecording)
    this.portal.on('cache.getSizeByCacheName', this.getSizeByCacheName)
    this.portal.on('cache.clearByCacheName', this.clearByCacheName)
    return this.portal.on('cache.getVersion', () => Promise.resolve('|HASH|'))
  }
  // portal.on 'cache.onUpdateAvailable', onUpdateAvailable

  topOnData = (fn) => {
    this.onPushFn = fn
  }

  pushSetContextId = (options) => {
    this.contextId = options.contextId
  }

  deleteHtmlCache = () => {
    console.log('portal update cache', `html:${this.cache.cachesFiles.html.version}`)
    const cache = this.cache.cachesFiles.html
    return this.cache.updateCache(cache, 'html')
  }

  startRecording = () => {
    this.cache.isRecording = true
  }

  stopRecording = () => {
    this.cache.isRecording = false
  }

  getSizeByCacheName = ({ cacheName }) => {
    return this.cache.getSizeByCacheName(cacheName)
  }

  clearByCacheName = ({ cacheName }) => {
    return this.cache.clearByCacheName(cacheName)
  }
}
