{z, classKebab, useContext, useStream} = require 'zorium'
_map = require 'lodash/map'
_isEmpty = require 'lodash/isEmpty'

$icon = require '../icon'
$spinner = require '../spinner'
DateService = require '../../services/date'
colors = require '../../colors'
context = require '../../context'
config = require '../../config'

if window?
  require './index.styl'

module.exports = $notifications = ->
  {model, router} = useContext context

  useEffect ->
    return beforeUnmount
  , []

  {notifications} = useStream ->
    notifications: model.notification.getAll().map (notifications) ->
      _map notifications, (notification) ->
        {
          notification: notification
        }

  beforeUnmount = ->
    model.exoid.invalidate 'notifications.getAll', {}
    model.exoid.invalidate 'notifications.getUnreadCount', {}

  z '.z-notifications',
    if notifications and _isEmpty notifications
      z '.no-notifications',
        z $notificationsIcon,
          icon: 'notifications-none'
          isTouchTarget: false
          size: '80px'
          color: colors.$black26
        z '.message',
          'You\'re all caught up!'
    else if notifications
      _map notifications, ({notification}) ->
        isUnread = not notification.isRead

        z '.notification', {
          className: classKebab {isUnread}
          onclick: ->
            if notification.data?.path
              router.go(
                notification.data.path.key, notification.data.path.params
                {qs: notification.data.path.qs}
              )
        },
          z '.icon',
            z $icon,
              icon: model.notification.ICON_MAP[notification.data.type] or
                      'off-topic'
              color: if isUnread \
                     then colors.$secondaryMain \
                     else colors.$bgText54
              isTouchTarget: false
          z '.right',
            z '.title', "#{notification.title}: #{notification.text}"
            z '.time', DateService.fromNow notification.time
    else
      z $spinner, {model}
