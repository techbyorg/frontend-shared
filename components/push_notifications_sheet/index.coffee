{z, useContext} = require 'zorium'

$button = require '../button'
$icon = require '../icon'
$sheet = require '../sheet'
PushService = require '../../services/push'
colors = require '../../colors'
context = require '../../context'

module.exports = $pushNotificationSheet = ->
  {model, lang} = useContext context

  z '.z-push-notifications-sheet',
    z $sheet, {
      $content:
        z '.z-push-notifications-sheet_content',
          z '.icon',
            z $icon,
              icon: 'notifications'
              color: colors.$primaryMain
              isTouchTarget: false
          z '.message', lang.get 'pushNotificationsSheet.message'
      $actions:
        z '.z-push-notifications-sheet_actions',
          z $button,
            text: lang.get 'general.notNow'
            isFullWidth: false
            onclick: -> model.overlay.close {action: 'complete'}
          z $button,
            isFullWidth: false
            text: lang.get 'pushNotificationsSheet.submitButtonText'
            onclick: ->
              PushService.register {model}
              .catch -> null
              .then ->
                model.overlay.close {action: 'complete'}
    }
