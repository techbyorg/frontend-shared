import RouterService from '../services/router'
import Language from '../services/language'
import config from '../config'

router = new RouterService {
  router: null
  lang: new Language()
}

module.exports = class Push
  listen: =>
    self.addEventListener 'push', @onPush

    self.addEventListener 'notificationclick', @onNotificationClick

  onPush: (e) ->
    console.log 'PUSH', e
    message = if e.data then e.data.json() else {}
    console.log message
    if message.data?.title
      message = message.data
      message.data = try
        JSON.parse message.data
      catch error
        {}

    if message.data?.path
      path = router.get message.data.path.key, message.data.path.params
    else
      path = ''

    e.waitUntil(
      clients.matchAll {
        includeUncontrolled: true
        type: 'window'
      }
      .then (activeClients) ->
        isFocused = activeClients?.some (client) ->
          client.focused

        if not isFocused or (
          contextId and contextId isnt message.data?.contextId
        )
          self.registration.showNotification 'TechBy',
            icon: if message.icon \
                  then message.icon \
                  else "#{config.CDN_URL}/android-chrome-192x192.png"
            title: message.title
            body: message.body
            tag: message.data?.path
            vibrate: [200, 100, 200]
            data: _.defaults {
              url: "https://#{config.HOST}#{path}"
              path: message.data?.path
            }, message.data or {}
    )

  onNotificationClick: (e) ->
    e.notification.close()

    e.waitUntil(
      clients.matchAll {
        includeUncontrolled: true
        type: 'window'
      }
      .then (activeClients) ->
        if activeClients.length > 0
          activeClients[0].focus()
          onPushFn? e.notification.data
        else
          clients.openWindow e.notification.data.url
    )
