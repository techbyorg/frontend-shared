import { z, classKebab, useRef } from 'zorium'

import Environment from '../../services/environment'

if (typeof window !== 'undefined') { require('./index.styl') }

// adding to DOM directly is actually a little faster in this case
// than doing a full re-render. ideally zorium would just diff the relevant
// components

// note that ripples are slow if network requestsStream are happening simultaneously

const ANIMATION_TIME_MS = 350

function ripple (param) {
  if (param == null) { param = {} }
  const { $$target, color, isCenter, mouseX, mouseY, onComplete, fadeIn } = param
  const $$wave = $$target.querySelector('.wave')

  if (!$$wave) {
    return
  }

  const { width, height, top, left } = $$target.getBoundingClientRect()

  let x, y

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
    setTimeout(() => { $$wave.className = 'wave' }, 100)
  } // give some time for onComplete to render
  , ANIMATION_TIME_MS))
}

export default function $ripple (props) {
  const { color, isCircle, isCenter, onComplete, fadeIn } = props

  const $$ref = useRef()

  function onTouch (e) {
    const $$target = e.target
    ripple({
      $$target,
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
