/* eslint-disable
    no-return-assign,
    no-unused-vars,
    prefer-const,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, classKebab, useContext, useRef, useMemo } from 'zorium'

import Environment from '../../services/environment'
import context from '../../context'
let $ripple

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

// adding to DOM directly is actually a little faster in this case
// than doing a full re-render. ideally zorium would just diff the relevant
// components

// note that ripples are slow if network requestsStream are happening simultaneously

const ANIMATION_TIME_MS = 350

export default $ripple = function ({ color, isCircle, isCenter, onComplete, fadeIn }) {
  const { colors } = useContext(context)
  let $$ref = useRef()

  function ripple (param) {
    let mouseX, mouseY, x, y
    let $$ref, color, isCenter, onComplete, fadeIn
    if (param == null) { param = {} }
    ({ $$ref, color, isCenter, mouseX, mouseY, onComplete, fadeIn } = param)
    const $$wave = $$ref.querySelector('.wave')

    if (!$$wave) {
      return
    }

    const { width, height, top, left } = $$ref.getBoundingClientRect()

    if (isCenter) {
      x = width / 2
      y = height / 2
    } else {
      x = mouseX - left
      y = mouseY - top
    }

    $$wave.style.top = y + 'px'
    $$wave.style.left = x + 'px'
    $$wave.style.backgroundColor = color
    $$wave.className = fadeIn
      ? 'wave fade-in is-visible'
      : 'wave is-visible'

    return new Promise((resolve, reject) => setTimeout(function () {
      onComplete?.()
      resolve()
      return setTimeout(() => $$wave.className = 'wave'
        , 100)
    } // give some time for onComplete to render
    , ANIMATION_TIME_MS))
  }

  function onTouch (e) {
    $$ref = e.target
    return ripple({
      $$ref,
      color,
      isCenter,
      onComplete,
      fadeIn,
      mouseX: e.clientX || e.touches?.[0]?.clientX,
      mouseY: e.clientY || e.touches?.[0]?.clientY
    })
  }

  return z('.z-ripple', {
    ref: $$ref,
    className: classKebab({ isCircle }),
    ontouchstart: onTouch,
    onmousedown: Environment.isAndroid() ? null : onTouch
  },
  z('.wave'))
}
