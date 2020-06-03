import {z, classKebab, createPortal, useContext, useEffect, useMemo, useRef} from 'zorium'

if window?
  require './index.styl'

import $button from '../button'
import $icon from '../icon'
import {closeIconPath} from '../icon/paths'
import context from '../../context'

CLOSE_DELAY_MS = 450 # 0.45s for animation

export default $dialog = (props) ->
  {onClose, $content = '', $title, $actions, isWide} = props
  {colors} = useContext context

  $$ref = useRef()

  {$$overlays} = useMemo ->
    {
      $$overlays: document?.getElementById 'overlays-portal'
    }
  , []

  useEffect ->
    setTimeout (-> $$ref.current.classList.add 'is-mounted'), 0
    window.addEventListener 'keydown', keyListener

    return ->
      window.removeEventListener 'keydown', keyListener
  , []

  close = ->
    $$ref.current.classList.remove 'is-mounted'
    setTimeout ->
      onClose()
    , CLOSE_DELAY_MS

  keyListener = (e) ->
    if (e.key == 'Escape' or e.key == 'Esc' or e.keyCode == 27)
      e.preventDefault()
      close()

  createPortal(
    z '.z-dialog', {
      ref: $$ref
      className: classKebab {isWide}
    },
      z '.backdrop', {
        onclick: close
      }

      z '.dialog',
        if $title
          z '.title',
            $title
            z '.close',
              z $icon, {
                icon: closeIconPath
                color: colors.$bgText26
                onclick: close
              }
        z '.content',
          $content
        if $actions
          z '.actions', $actions
    $$overlays
  )
