/* eslint-disable
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, classKebab, useContext, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as rx from 'rxjs/operators'

import $icon from '../icon'
import $spinner from '../spinner'
import DateService from '../../services/date'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $notifications () {
  const { model, router, colors } = useContext(context)

  useEffect(() => beforeUnmount
    , [])

  const { notifications } = useStream(() => ({
    notifications: model.notification.getAll().pipe(rx.map(notifications => _.map(notifications, notification => ({
      notification
    }))))
  }))

  function beforeUnmount () {
    model.exoid.invalidate('notifications.getAll', {})
    return model.exoid.invalidate('notifications.getUnreadCount', {})
  }

  return z('.z-notifications',
    notifications && _.isEmpty(notifications)
      ? z('.no-notifications',
        z($notificationsIcon, {
          icon: 'notifications-none',
          size: '80px',
          color: colors.$black26
        }
        ),
        z('.message',
          'You\'re all caught up!')
      )
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
          },
          z('.icon',
            z($icon, {
              icon: '', // TODO
              color: isUnread
                ? colors.$secondaryMain
                : colors.$bgText54
            }
            )
          ),
          z('.right',
            z('.title', `${notification.title}: ${notification.text}`),
            z('.time', DateService.fromNow(notification.time)))
          )
        })
        : z($spinner, { model }))
}
