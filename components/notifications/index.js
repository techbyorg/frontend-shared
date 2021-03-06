import { z, classKebab, useContext, useEffect, useStream } from 'zorium'
import * as _ from 'lodash-es'

import $icon from '../icon'
import $spinner from '../spinner'
import DateService from '../../services/date'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $notifications () {
  const { model, router, colors } = useContext(context)

  useEffect(() => {
    return () => {
      model.exoid.invalidate('notifications.getAll', {})
      model.exoid.invalidate('notifications.getUnreadCount', {})
    }
  }, [])

  const { notifications } = useStream(() => ({
    notifications: model.notification.getAll()
  }))

  return z('.z-notifications', [
    notifications && _.isEmpty(notifications)
      ? z('.no-notifications', [
        z($icon, {
          icon: 'notifications-none',
          size: '80px',
          color: colors.$black26
        }),
        z('.message', 'You\'re all caught up!')
      ])
      : notifications
        ? _.map(notifications, function ({ notification }) {
          const isUnread = !notification.isRead

          return z('.notification', {
            className: classKebab({ isUnread }),
            onclick () {
              if (notification.data?.path) {
                return router.go(
                  notification.data.path.key, notification.data.path.params,
                  { qs: notification.data.path.qs }
                )
              }
            }
          }, [
            z('.icon',
              z($icon, {
                icon: '', // TODO
                color: isUnread ? colors.$secondaryMain : colors.$bgText54
              })
            ),
            z('.right', [
              z('.title', `${notification.title}: ${notification.text}`),
              z('.time', DateService.fromNow(notification.time))
            ])
          ])
        })
        : z($spinner)
  ])
}
