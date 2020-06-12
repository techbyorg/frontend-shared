import { z, classKebab, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $checkbox from '../checkbox'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $dropdownMultiple (props) {
  const {
    valueStreams, errorStream, currentText, isDisabled = false
  } = props

  const { isOpenStream, options } = useMemo(() => {
    const options = _.map(props.options, function (option) {
      const isCheckedStreams = new Rx.ReplaySubject(1)
      isCheckedStreams.next(Rx.of(false))
      return { option, isCheckedStreams }
    })
    return {
      isOpenStream: new Rx.BehaviorSubject(false),
      options: options,
      valueStream: Rx.combineLatest(
        _.map(options, ({ isCheckedStreams }) =>
          isCheckedStreams.pipe(rx.switchAll())
        ), (...vals) => vals
      ).pipe(rx.map((values) =>
        _.filter(_.map(options, ({ option }, i) => {
          if (values[i]) {
            return option
          }
        }))
      ))
    }
  }, [])

  const { value, isOpen, error } = useStream(() => ({
    value: valueStreams.pipe(rx.switchAll()),
    isOpen: isOpenStream,
    error: errorStream
  }))

  const toggle = () => isOpenStream.next(!isOpen)

  return z('.z-dropdown-multiple', {
    // vdom doesn't key defaultValue correctly if elements are switched
    // key: _.kebabCase hintText
    className: classKebab({
      hasValue: value !== '',
      isDisabled,
      isOpen,
      isError: (error != null)
    })
  }, [
    z('.wrapper', { onclick: () => { toggle() } }),
    z('.current', { onclick: toggle }, [
      currentText,
      z('.arrow')
    ]),
    z('.options',
      _.map(options, ({ option }) =>
        z('label.option', [
          z('.text', option?.text),
          z('.checkbox', z($checkbox, { onChange: toggle }))
        ])
      )
    ),
    error && z('.error', error)
  ])
}
