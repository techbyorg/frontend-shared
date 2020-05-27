{z, useContext} = require 'zorium'
_defaults = require 'lodash/defaults'

$appBar = require '../app_bar'
$icon = require '../icon'
colors = require '../../colors'
context = require '../../context'

if window?
  require './index.styl'

module.exports = $actionBar = (props) ->
  {title, cancel, save, isSaving, isPrimary, isSecondary} = props
  {lang} = useContext context

  cancel = _defaults cancel, {
    icon: 'close'
    text: lang.get 'general.cancel'
    onclick: -> null
  }
  save = _defaults save, {
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
          onclick: (e) ->
            e?.stopPropagation()
            cancel.onclick e
      $topRightButton:
        if save?.onclick
          z $icon,
            icon: if isSaving then 'ellipsis' else save.icon
            color: color
            hasRipple: true
            onclick: (e) ->
              e?.stopPropagation()
              save.onclick e
      isFlat: true
    }
