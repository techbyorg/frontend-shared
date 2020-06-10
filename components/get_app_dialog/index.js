let $getAppDialog;
import {z, useContext} from 'zorium';

import $button from '../button';
import $dialog from '../dialog';
import context from '../../context';

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl');
}

export default $getAppDialog = function({onClose}) {
  const {config, lang, portal} = useContext(context);

  const iosAppUrl = config.IOS_APP_URL;
  const googlePlayAppUrl = config.GOOGLE_PLAY_APP_URL;

  return z('.z-get-app-dialog',
    z($dialog, {
      onClose,
      $title: lang.get('getAppDialog.title'),
      $content:
        z('.z-get-app-dialog_dialog',
          z('.badge.ios', {
            onclick() {
              return portal.call('browser.openWindow', {
                url: iosAppUrl,
                target: '_system'
              }
              );
            }
          }),
          z('.badge.android', {
            onclick() {
              return portal.call('browser.openWindow', {
                url: googlePlayAppUrl,
                target: '_system'
              }
              );
            }
          }),
          z('.text',
            lang.get('getAppDialog.text'))
        ),
      $actions:
        z($button, {
          text: lang.get('general.cancel'),
          onclick: onClose
        }
        )
    }
    )
  );
};
