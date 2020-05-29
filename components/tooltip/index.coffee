import {z, classKebab, useContext, useEffect, useStream} from 'zorium'
import * as _ from 'lodash-es'
RxBehaviorSubject = require('rxjs/BehaviorSubject').BehaviorSubject

import $icon from '../icon'
import colors from '../../colors'
import context from '../../context'

if window?
  require './index.styl'

# FIXME: use $positionedOverlay
module.exports = $tooltip = (props) ->
  {$$target, key, anchor, offset, isVisibleStream, zIndex
    $title, $content} = props
  {cookie} = useContext context

  close = ->
    completedTooltips = try
      cookie.get('completedTooltips').split(',')
    catch error
      []
    completedTooltips ?= []
    cookie.set 'completedTooltips', _.uniq(
      completedTooltips.concat [key]
    ).join(',')
    $positionedOverlay.close()

    isVisibleStream.next false
  z ".z-tooltip.anchor-#{anchor}", {
    ref: $$target
    className: classKebab {isVisible}
    style: style
  },
    z $positionedOverlay,
      $content: [
        z '.close',
          z $icon,
            icon: 'close'
            size: '16px'
            isTouchTarget: false
            color: colors.$bgText54
            onclick: close
        z '.content',
          z '.title', $title
          $content
      ]
