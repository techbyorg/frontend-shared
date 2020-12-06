import { z, useContext } from 'zorium'

import $button from '../button'
import $snackBar from '../snack_bar'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $unsavedSnackBar ({ onCancel, onSave }) {
  const { lang } = useContext(context)

  return z('.z-unsaved-snack-bar', [
    z($snackBar, {
      $content: lang.get('unsavedSnackBar.title'),
      $actions: z('.z-unsaved-snack-bar_actions', [
        z($button, {
          text: lang.get('general.cancel'),
          isFullWidth: false,
          onclick: onCancel
        }),
        z($button, {
          text: lang.get('general.save'),
          isFullWidth: false,
          isPrimary: true,
          onclick: onSave,
          shouldHandleLoading: true
        })
      ])
    })
  ])
}
