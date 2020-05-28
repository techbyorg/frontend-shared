import {z, createPortal, useContext, useRef, useMemo, useEffect} from 'zorium'
import _defaults from 'lodash/defaults'

import $icon from '../icon'
import $button from '../button'
import colors from '../../colors'
import context from '../../context'
import config from '../../config'

CLOSE_DELAY_MS = 450 # 0.45s for animation

if window?
  require './index.styl'

module.exports = $sheet = (props) ->
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
