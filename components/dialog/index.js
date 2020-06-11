/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, classKebab, createPortal, useContext, useEffect, useMemo, useRef } from 'zorium'

import $button from '../button'
import $icon from '../icon'
import { closeIconPath } from '../icon/paths'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

const CLOSE_DELAY_MS = 450 // 0.45s for animation

export default function $dialog (props) {
  const {
    onClose
  } = props
  const val = props.$content
  const $content = val != null ? val : ''
  const {
    $title,
    $actions,
    isWide
  } = props
  const { colors } = useContext(context)

  const $$ref = useRef()

  const { $$overlays } = useMemo(() => ({
    $$overlays: globalThis?.document?.getElementById('overlays-portal')
  })
  , [])

  useEffect(function () {
    setTimeout(() => $$ref.current.classList.add('is-mounted'), 0)
    window.addEventListener('keydown', keyListener)

    return () => window.removeEventListener('keydown', keyListener)
  }
  , [])

  function close () {
    $$ref.current.classList.remove('is-mounted')
    return setTimeout(() => onClose()
      , CLOSE_DELAY_MS)
  }

  function keyListener (e) {
    if ((e.key === 'Escape') || (e.key === 'Esc') || (e.keyCode === 27)) {
      e.preventDefault()
      return close()
    }
  }

  return createPortal(
    z('.z-dialog', {
      ref: $$ref,
      className: classKebab({ isWide })
    },
    z('.backdrop', {
      onclick: close
    }),

    z('.dialog',
      $title
        ? z('.title',
          $title,
          z('.close',
            z($icon, {
              icon: closeIconPath,
              color: colors.$bgText26,
              onclick: close
            }))) : undefined,
      z('.content',
        $content),
      $actions
        ? z('.actions', $actions) : undefined
    )
    ),
    $$overlays
  )
}
