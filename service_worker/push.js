import * as _ from 'lodash-es'
import RouterService from '../services/router'
import Language from '../services/language'

const router = new RouterService({
  router: null,
  lang: new Language()
})

export default class Push {
  constructor ({ cdnUrl, host }) {
    this.listen = this.listen.bind(this)
    this.cdnUrl = cdnUrl; this.host = host
  }

  listen () {
    self.addEventListener('push', this.onPush)

    return self.addEventListener('notificationclick', this.onNotificationClick)
  }

  onPush (e) {
    let path
    console.log('PUSH', e)
    let message = e.data ? e.data.json() : {}
    console.log(message)
    if (message.data?.title) {
      message = message.data
      message.data = (() => {
        try {
          return JSON.parse(message.data)
        } catch (error) {
          return {}
        }
      })()
    }

    if (message.data?.path) {
      path = router.get(message.data.path.key, message.data.path.params)
    } else {
      path = ''
    }

    return e.waitUntil(
      globalThis?.clients.matchAll({
        includeUncontrolled: true,
        type: 'window'
      })
        .then(function (activeClients) {
          const isFocused = activeClients?.some(client => client.focused)

          if (!isFocused || (
            globalThis?.contextId && (globalThis?.contextId !== message.data?.contextId)
          )) {
            return self.registration.showNotification('TechBy', {
              icon: message.icon
                ? message.icon
                : `${this.cdnUrl}/android-chrome-192x192.png`,
              title: message.title,
              body: message.body,
              tag: message.data?.path,
              vibrate: [200, 100, 200],
              data: _.defaults({
                url: `https://${this.host}${path}`,
                path: message.data?.path
              }, message.data || {})
            })
          }
        })
    )
  }

  onNotificationClick (e) {
    e.notification.close()

    return e.waitUntil(
      globalThis?.clients.matchAll({
        includeUncontrolled: true,
        type: 'window'
      })
        .then(function (activeClients) {
          if (activeClients.length > 0) {
            activeClients[0].focus()
            return this.onPushFn?.(e.notification.data)
          } else {
            return globalThis?.clients.openWindow(e.notification.data.url)
          }
        })
    )
  }
}
