import {z, useContext} from 'zorium'

import $button from '../button'
import $dialog from '../dialog'
import context from '../../context'

if window?
  require './index.styl'

export default $getAppDialog = ({onClose}) ->
  {config, lang, portal} = useContext context

  iosAppUrl = config.IOS_APP_URL
  googlePlayAppUrl = config.GOOGLE_PLAY_APP_URL

  z '.z-get-app-dialog',
    z $dialog,
      onClose: onClose
      $title: lang.get 'getAppDialog.title'
      $content:
        z '.z-get-app-dialog_dialog',
          z '.badge.ios', {
            onclick: ->
              portal.call 'browser.openWindow',
                url: iosAppUrl
                target: '_system'
          }
          z '.badge.android', {
            onclick: ->
              portal.call 'browser.openWindow',
                url: googlePlayAppUrl
                target: '_system'
          }
          z '.text',
            lang.get 'getAppDialog.text'
      $actions:
        z $button,
          text: lang.get 'general.cancel'
          onclick: onClose
