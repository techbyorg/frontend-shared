import {z, classKebab, useRef, useMemo} from 'zorium'
import Environment from '../../services/environment'

import colors from '../../colors'

if window?
  require './index.styl'

# adding to DOM directly is actually a little faster in this case
# than doing a full re-render. ideally zorium would just diff the relevant
# components

# note that ripples are slow if network requestsStream are happening simultaneously

ANIMATION_TIME_MS = 350

module.exports = $ripple = ({color, isCircle, isCenter, onComplete, fadeIn}) ->
  $$ref = useRef()

  ripple = ({$$ref, color, isCenter, mouseX, mouseY, onComplete, fadeIn} = {}) ->
    $$wave = $$ref.querySelector '.wave'

    unless $$wave
      return

    {width, height, top, left} = $$ref.getBoundingClientRect()

    if isCenter
      x = width / 2
      y = height / 2
    else
      x = mouseX - left
      y = mouseY - top

    $$wave.style.top = y + 'px'
    $$wave.style.left = x + 'px'
    $$wave.style.backgroundColor = color
    $$wave.className = if fadeIn \
                       then 'wave fade-in is-visible' \
                       else 'wave is-visible'

    new Promise (resolve, reject) ->
      setTimeout ->
        onComplete?()
        resolve()
        setTimeout ->
          $$wave.className = 'wave'
        , 100 # give some time for onComplete to render
      , ANIMATION_TIME_MS

  onTouch = (e) ->
    $$ref = e.target
    ripple {
      $$ref
      color
      isCenter
      onComplete
      fadeIn
      mouseX: e.clientX or e.touches?[0]?.clientX
      mouseY: e.clientY or e.touches?[0]?.clientY
    }

  z '.z-ripple', {
    ref: $$ref
    className: classKebab {isCircle}
    ontouchstart: onTouch
    onmousedown: if Environment.isAndroid() then null else onTouch
  },
    z '.wave'
