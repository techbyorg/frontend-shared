/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import PushService from './push'
import Environment from './environment'

if (typeof window !== 'undefined' && window !== null) {
  const PortalGun = require('portal-gun')
}

class ServiceWorkerService {
  constructor () {
    this.register = this.register.bind(this)
    this.handleUpdate = this.handleUpdate.bind(this)
  }

  register ({ model, lang, onError }) {
    try {
      console.log('registering service worker...')
      return navigator.serviceWorker?.register('/service_worker.js')
      .then(registration => {
        console.log('service worker registered')
        PushService.setFirebaseServiceWorker(registration)

        this.hasActiveServiceWorker = Boolean(registration.active)

        return this.listenForWaitingServiceWorker(registration, registration => {
          return this.handleUpdate(registration, { model, lang })
        })
      })
      .catch(function (err) {
        console.log('sw promise err', err)
        return onError?.(err)
      })
    } catch (error) {
      const err = error
      return console.log('sw err', err)
    }
  }

  handleUpdate (registration, { model, lang }) {
    if (this.hasActiveServiceWorker) {
      return model.statusBar.open({
        text: lang.get('status.newVersion'),
        type: 'snack',
        action: {
          icon: 'refresh',
          onclick () {
            return window.location.reload()
          }
        }
      })
    }
  }
  // PushService.setFirebaseServiceWorker registration

  // TODO: portal is no longer connected at this point... need to reconnect
  // to new service worker
  // portal.updateServiceWorker registration
  //
  // portal.call 'cache.getVersion'
  // .then (version) ->
  //   if version isnt '|HASH|' # replaced by gulp build
  //     model.statusBar.open {
  //       text: lang.get 'status.newVersion'
  //     }

  // https://redfin.engineering/how-to-fix-the-refresh-button-when-using-service-workers-a8e27af6df68
  /*
  could detect service worker changes here, then request refresh
  */
  listenForWaitingServiceWorker (reg, callback) {
    const awaitStateChange = () => reg.installing.addEventListener('statechange', function () {
      if (this.state === 'installed') {
        return callback(reg)
      }
    })

    if (!reg) {
      return
    }
    if (reg.waiting) {
      return callback(reg)
    }
    if (reg.installing) {
      awaitStateChange()
    }
    return reg.addEventListener('updatefound', awaitStateChange)
  }
}

export default new ServiceWorkerService()
