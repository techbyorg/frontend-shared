import { z, useContext } from 'zorium'

import $button from '../button'
import $icon from '../icon'
import $sheet from '../sheet'
import { notificationsIconPath } from '../icon/paths'
import PushService from '../../services/push'
import context from '../../context'

export default function $pushNotificationSheet () {
  const { model, lang, colors } = useContext(context)

  return z('.z-push-notifications-sheet', [
    z($sheet, {
      $content:
        z('.z-push-notifications-sheet_content', [
          z('.icon', [
            z($icon, {
              icon: notificationsIconPath,
              color: colors.$primaryMain
            })
          ]),
          z('.message', lang.get('pushNotificationsSheet.message'))
        ]),
      $actions:
        z('.z-push-notifications-sheet_actions', [
          z($button, {
            text: lang.get('general.notNow'),
            isFullWidth: false,
            onclick: () => { model.overlay.close({ action: 'complete' }) }
          }),
          z($button, {
            isFullWidth: false,
            text: lang.get('pushNotificationsSheet.submitButtonText'),
            onclick: () => {
              PushService.register({ model })
                .catch(() => null)
                .then(() => model.overlay.close({ action: 'complete' }))
            }
          })
        ])
    })
  ])
}
