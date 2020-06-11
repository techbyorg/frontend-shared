/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, createPortal, useRef, useMemo, useEffect } from 'zorium'

import $icon from '../icon'
import $button from '../button'

const CLOSE_DELAY_MS = 450 // 0.45s for animation

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $sheet (props) {
  const { onClose, $content, $actions } = props

  const $$ref = useRef()

  const { $$overlays } = useMemo(() => ({
    $$overlays: globalThis?.document?.getElementById('overlays-portal')
  })
  , [])

  useEffect(() => setTimeout(() => $$ref.current?.classList.add('is-mounted'), 0)
    , [])

  function close () {
    $$ref.current?.classList.remove('is-mounted')
    return setTimeout(() => onClose()
      , CLOSE_DELAY_MS)
  }

  return createPortal(
    z('.z-sheet', {
      ref: $$ref
    },
    z('.backdrop',
      { onclick: close }),
    z('.sheet',
      z('.inner',
        $content,
        $actions
          ? z('.actions', $actions) : undefined
      )
    )
    ),
    $$overlays
  )
}
