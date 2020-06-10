// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
export default class OfflineDataModel {
  constructor ({ exoid, portal, lang, statusBar }) {
    this.record = this.record.bind(this)
    this.save = this.save.bind(this)
    this.exoid = exoid
    this.portal = portal
    this.lang = lang
    this.statusBar = statusBar
    this.isRecording = false
  }

  record () {
    this.isRecording = true
    this.statusBar.open({
      text: this.lang.get('status.recordingData'),
      onclick: this.save
    })
    this.exoid.invalidateAll()
    return setTimeout(() => {
      this.exoid.disableInvalidation()
      // @exoid.getCacheStream().subscribe (cache) ->
      //   console.log 'cache', JSON.stringify(cache).length
      this.exoid.getCacheStream().subscribe(cache => {
        return console.log(cache)
      })

      return this.portal.call('cache.startRecording')
    }
    , 0)
  }

  save () {
    this.isRecording = false
    this.exoid.getCacheStream().take(1).subscribe(cache => {
      this.exoid.enableInvalidation();
      (typeof localStorage !== 'undefined' && localStorage !== null) && (localStorage.offlineCache = JSON.stringify(cache))
      return this.statusBar.close()
    })
    return this.portal.call('cache.stopRecording')
  }
}
