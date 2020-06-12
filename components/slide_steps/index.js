import { z, classKebab, useContext, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'

import $tabs from '../tabs'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $slideSteps ({ onSkip, onDone, steps, doneText }) {
  const { lang } = useContext(context)

  const { selectedIndexStream } = useMemo(() => {
    return {
      selectedIndexStream: new Rx.BehaviorSubject(0)
    }
  }, [])

  const { selectedIndex } = useStream(() => ({
    selectedIndex: selectedIndexStream
  }))

  return z('.p-slide-steps', [
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
    ])
  ])
}
