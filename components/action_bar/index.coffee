import {z, useContext} from 'zorium'
import * as _ from 'lodash-es'

import $appBar from '../app_bar'
import $icon from '../icon'
import {ellipsisIconPath} from '../icon/paths'
import context from '../../context'

if window?
  require './index.styl'

export default $actionBar = (props) ->
  {title, cancel, save, isSaving, isPrimary, isSecondary} = props
  {lang, colors} = useContext context

  cancel = _.defaults cancel, {
    icon: 'close'
    text: lang.get 'general.cancel'
    onclick: -> null
  }
  save = _.defaults save, {
    icon: 'check'
    text: lang.get 'general.save'
    # onclick: -> null
  }

  if isPrimary
    color = colors.$primaryMainText
    # bgColor = colors.$primaryMain
  else if isSecondary
    color = colors.$secondaryMainText
    # bgColor = colors.$secondaryMain
  else
    color = colors.$header500Icon
    # bgColor = colors.$header500

  z '.z-action-bar',
    z $appBar, {
      title: title
      isPrimary
      isSecondary
      $topLeftButton:
        z Icon,
          icon: cancel.icon
          color: color
          hasRipple: true
          isTouchTarget: true
          onclick: (e) ->
            e?.stopPropagation()
            cancel.onclick e
      $topRightButton:
        if save?.onclick
          z $icon,
            icon: if isSaving then ellipsisIconPath else save.icon
            color: color
            hasRipple: true
            isTouchTarget: true
            onclick: (e) ->
              e?.stopPropagation()
              save.onclick e
      isFlat: true
    }
