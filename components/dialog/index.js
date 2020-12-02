/*
dialogs should have their own component that imports/renders this component.
dialog components should be conditionally rendered by parents, so the
components don't get mounted until visible
*/

import { z, classKebab, createPortal, useContext, useEffect, useMemo, useRef } from 'zorium'

import $icon from '../icon'
import { closeIconPath } from '../icon/paths'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

const CLOSE_DELAY_MS = 450 // 0.45s for animation

export default function $dialog (props) {
  const { onClose, $title, $actions, isWide, $content = '' } = props
  const { colors } = useContext(context)

  const $$ref = props.$$ref || useRef()

  const { $$overlays } = useMemo(() => ({
    $$overlays: globalThis?.document?.getElementById('overlays-portal')
  }), [])

  useEffect(() => {
    setTimeout(() => $$ref.current.classList.add('is-mounted'), 0)
    window.addEventListener('keydown', keyListener)

    return () => window.removeEventListener('keydown', keyListener)
  }, [])

  function close () {
    $$ref.current.classList.remove('is-mounted')
    setTimeout(() => onClose(), CLOSE_DELAY_MS)
  }

  function keyListener (e) {
    if ((e.key === 'Escape') || (e.key === 'Esc') || (e.keyCode === 27)) {
      e.preventDefault()
      close()
    }
  }

  return createPortal(
    z('.z-dialog', { ref: $$ref, className: classKebab({ isWide }) }, [
      z('.backdrop', { onclick: close }),
      z('.dialog', [
        $title &&
          z('.title', [
            z('.text', $title),
            z('.close', [
              z($icon, {
                icon: closeIconPath,
                color: colors.$bgText26,
                onclick: close
              })
            ])
          ]),
        z('.content', $content),
        $actions && z('.actions', $actions)
      ])
    ])
    , $$overlays
  )
}
