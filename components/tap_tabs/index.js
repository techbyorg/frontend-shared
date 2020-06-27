import { z, classKebab, useContext, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'

import { streamsOrStream, setStreamsOrStream } from '../../services/obs'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $tapTabs (props) {
  const { selectedIndexStreams, tabs, tabProps } = props
  const { router } = useContext(context)

  const { selectedIndexStream } = useMemo(() => {
    return {
      selectedIndexStream: props.selectedIndexStream || new Rx.BehaviorSubject(0)
    }
  }, [])

  const { selectedIndex } = useStream(() => ({
    selectedIndex: streamsOrStream(selectedIndexStreams, selectedIndexStream)
  }))

  return z('.z-tap-tabs', [
    z('.menu', [
      z('.container',
        _.map(tabs, function ({ name, route }, i) {
          const isSelected = selectedIndex === i

          return router.linkIfHref(z('.tap-tab', {
            className: classKebab({ isSelected }),
            href: route,
            onclick: () => {
              setStreamsOrStream(selectedIndexStreams, selectedIndexStream, i)
            }
          }, name))
        })
      )
    ]),

    z('.current-tab', [
      z('.container', [
        (selectedIndex != null) && z(tabs[selectedIndex].$el, tabProps)
      ])
    ])
  ])
}
