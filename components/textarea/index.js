/* eslint-disable
    no-return-assign,
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, classKebab, useContext, useRef, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import context from '../../context'
let $textarea

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

const DEFAULT_TEXTAREA_HEIGHT = 59

export default $textarea = function (props) {
  let textareaHeightStream
  let {
    valueStream,
    valueStreams,
    errorStream,
    isFocusedStream,
    defaultHeight,
    colors
  } = props
  const val = props.hintText
  const hintText = val != null ? val : ''
  const val1 = props.type
  const type = val1 != null ? val1 : 'text'
  const {
    isFloating,
    isDisabled,
    isFull,
    isDark,
    isCentered
  } = props
  const allColors = useContext(context).colors

  const $$ref = useRef();

  ({ valueStream, errorStream, isFocusedStream, textareaHeightStream } = useMemo(() => ({
    valueStream: valueStream || new Rx.BehaviorSubject(''),
    errorStream: errorStream || new Rx.BehaviorSubject(null),
    isFocusedStream: isFocusedStream || new Rx.BehaviorSubject(false),

    textareaHeightStream: new Rx.BehaviorSubject(
      defaultHeight || DEFAULT_TEXTAREA_HEIGHT
    )
  })))

  const { isFocused, textareaHeight, value, error } = useStream(() => ({
    isFocused: isFocusedStream,
    textareaHeight: textareaHeightStream,
    value: valueStreams?.pipe(rx.switchAll()) || valueStream,
    error: errorStream
  }))

  useEffect(function () {
    const $$textarea = $$ref.current.querySelector('#textarea')
    valueStreams.pipe(rx.take(1)).subscribe(() => setTimeout(() => resizeTextarea({ target: $$textarea })
      , 0))
    return null
  }
  , [])

  function setValueFromEvent (e) {
    e?.preventDefault()

    return setValue(e.target.value)
  }

  function setValue (value, param) {
    if (param == null) { param = {} }
    const { updateDom } = param
    if (valueStreams) {
      valueStreams.next(Rx.of(value))
    } else {
      value.next(value)
    }

    if (updateDom) {
      return $$textarea.value = value
    }
  }

  function resizeTextarea (e) {
    const $$textarea = e.target
    $$textarea.style.height = `${defaultHeight || DEFAULT_TEXTAREA_HEIGHT}px`
    const newHeight = $$textarea.scrollHeight
    $$textarea.style.height = `${newHeight}px`
    $$textarea.scrollTop = newHeight
    if (textareaHeight !== newHeight) {
      textareaHeight.next(newHeight)
      return onResize?.()
    }
  }

  // FIXME: useref for parent to reference this, or just pass in streams?
  ({
    getHeightPxStream () {
      return textareaHeightStream.map(height => // max height in css
        Math.min(height, 150))
    }
  })

  colors = _.defaults(colors, {
    c500: allColors.$bgText54,
    background: allColors.$bgText12,
    underline: allColors.$primaryMain
  })

  return z('.z-textarea', {
    ref: $$ref,
    className: classKebab({
      isDark,
      isFloating,
      hasValue: value !== '',
      isFocused,
      isDisabled,
      isCentered,
      isFull,
      isError: (error != null)
    }),
    style: {
      // backgroundColor: colors.background
      color: colors.c500,
      height: `${textareaHeight}px`
    }
  },
  z('.hint', {
    style: {
      color: isFocused && (error == null)
        ? colors.c500 : undefined
    }
  },
  hintText),
  z('textarea.textarea#textarea', {
    disabled: Boolean(isDisabled),
    type,
    value,
    oninput: z.ev(function (e, $$ref) {
      resizeTextarea(e)
      if (valueStreams) {
        return valueStreams.next(Rx.of($$ref.current.value))
      } else {
        return value.next($$ref.current.value)
      }
    }),
    onfocus: z.ev((e, $$ref) => isFocused.next(true)),
    onblur: z.ev((e, $$ref) => isFocused.next(false)),

    // onkeyup: setValueFromEvent
    // bug where cursor goes to end w/ just value
    defaultValue: value || ''
  }
  ),
  z('.underline-wrapper',
    z('.underline', {
      style: {
        backgroundColor: isFocused && (error == null)
          ? colors.underline || colors.c500 : null
      }
    }
    )
  ),
  (error != null)
    ? z('.error', error) : undefined
  )
}
