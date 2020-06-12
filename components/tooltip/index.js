import { z, classKebab, useContext, useStream } from 'zorium'
import * as _ from 'lodash-es'

import $icon from '../icon'
import $positionedOverlay from '../positioned_overlay'
import { closeIconPath } from '../icon/paths'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

// FIXME: use $positionedOverlay
export default function $tooltip (props) {
  const {
    $$target, key, anchor, isVisibleStream, $title, $content
  } = props
  const { cookie, colors } = useContext(context)

  const { isVisible } = useStream(() => ({
    isVisible: isVisibleStream
  }))

  function close () {
    let completedTooltips
    try {
      completedTooltips = cookie.get('completedTooltips').split(',')
    } catch (error) {
      completedTooltips = []
    }
    if (completedTooltips == null) { completedTooltips = [] }
    cookie.set('completedTooltips', _.uniq(
      completedTooltips.concat([key])
    ).join(','))
    $positionedOverlay.close()

    return isVisibleStream.next(false)
  }

  return z(`.z-tooltip.anchor-${anchor}`, {
    ref: $$target,
    className: classKebab({ isVisible })
  }, [
    z($positionedOverlay, {
      $content: [
        z('.close', [
          z($icon, {
            icon: closeIconPath,
            size: '16px',
            color: colors.$bgText54,
            onclick: close
          })
        ]),
        z('.content', [
          z('.title', $title),
          $content
        ])
      ]
    })
  ])
}
