import PushService from './push'
import Environment from './environment'

if window?
  PortalGun = require 'portal-gun'

class ServiceWorkerService
  register: ({model, onError}) =>
    try
      console.log 'registering service worker...'
      navigator.serviceWorker?.register '/service_worker.js'
      .then (registration) =>
        console.log 'service worker registered'
        PushService.setFirebaseServiceWorker registration

        @hasActiveServiceWorker = Boolean registration.active

        @listenForWaitingServiceWorker registration, (registration) =>
          @handleUpdate registration, {model}
      .catch (err) ->
        console.log 'sw promise err', err
        onError? err

    catch err
      console.log 'sw err', err

  handleUpdate: (registration, {model}) =>
    if @hasActiveServiceWorker
      model.statusBar.open {
        text: lang.get 'status.newVersion'
        type: 'snack'
        action:
          icon: 'refresh'
          onclick: ->
            window.location.reload()
      }
    # PushService.setFirebaseServiceWorker registration

    # TODO: portal is no longer connected at this point... need to reconnect
    # to new service worker
    # portal.updateServiceWorker registration
    #
    # portal.call 'cache.getVersion'
    # .then (version) ->
    #   if version isnt '|HASH|' # replaced by gulp build
    #     model.statusBar.open {
    #       text: lang.get 'status.newVersion'
    #     }

  # https://redfin.engineering/how-to-fix-the-refresh-button-when-using-service-workers-a8e27af6df68
  ###
  could detect service worker changes here, then request refresh
  ###
  listenForWaitingServiceWorker: (reg, callback) ->
    awaitStateChange = ->
      reg.installing.addEventListener 'statechange', ->
        if this.state is 'installed'
          callback reg

    unless reg
      return
    if reg.waiting
      return callback(reg)
    if reg.installing
      awaitStateChange()
    reg.addEventListener 'updatefound', awaitStateChange

export default new ServiceWorkerService()
