import {z, createPortal, useContext, useRef, useMemo, useEffect} from 'zorium'

import $icon from '../icon'
import $button from '../button'
import context from '../../context'

CLOSE_DELAY_MS = 450 # 0.45s for animation

if window?
  require './index.styl'

export default $sheet = (props) ->
  {onClose, $content, $actions} = props
  {lang} = useContext context

  $$ref = useRef()

  {$$overlays} = useMemo ->
    {
      $$overlays: document?.getElementById 'overlays-portal'
    }
  , []

  useEffect ->
    setTimeout (-> $$ref.current?.classList.add 'is-mounted'), 0
  , []

  close = ->
    $$ref.current?.classList.remove 'is-mounted'
    setTimeout ->
      onClose()
    , CLOSE_DELAY_MS

  createPortal(
    z '.z-sheet', {
      ref: $$ref
    },
      z '.backdrop',
        onclick: close
      z '.sheet',
        z '.inner',
          $content
          if $actions
            z '.actions', $actions
  $$overlays
  )
