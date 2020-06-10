/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, classKebab, useContext, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'

import $tabs from '../tabs'
import $icon from '../icon'
import context from '../../context'
let $slideSteps

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default $slideSteps = function ({ onSkip, onDone, steps, doneText }) {
  const { lang } = useContext(context)

  const { selectedIndexStream } = useMemo(() => ({
    selectedIndexStream: new Rx.BehaviorSubject(0)
  })
  , [])

  const { selectedIndex } = useStream(() => ({
    selectedIndex: selectedIndexStream
  }))

  return z('.p-slide-steps',
    z($tabs, {
      selectedIndex,
      hideTabBar: true,
      isBarFixed: false,
      tabs: _.map(steps, ({ $content }, i) => ({
        $menuText: `${i}`,
        $el: $content
      }))
    }),

    z('.bottom-bar', [
      (selectedIndex === 0) && onSkip
        ? z('.text', {
          onclick: onSkip
        },
        lang.get('general.skip'))
        : selectedIndex
          ? z('.text', {
            onclick () {
              return selectedIndex.next(Math.max(selectedIndex - 1, 0))
            }
          },
          lang.get('general.back'))
          : z('.text'),
      z('.step-counter',
        _.map(steps, function (step, i) {
          const isActive = i === selectedIndex
          return z('.step-dot',
            { className: classKebab({ isActive }) })
        })),
      selectedIndex < (steps?.length - 1)
        ? z('.text', {
          onclick () {
            return selectedIndex.next(
              Math.min(selectedIndex + 1, steps?.length - 1))
          }
        },
        lang.get('general.next'))
        : z('.text', {
          onclick: onDone
        },
        doneText || lang.get('general.gotIt'))
    ]))
}
