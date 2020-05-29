import {z, classKebab, useContext} from 'zorium'

import context from '../../context'

if window?
  require './index.styl'

export default $appBar = (props) ->
  {$topLeftButton, $topRightButton, title, bgColor, color, isFlat, isPrimary
    isSecondary, isFullWidth, hasLogo} = props
  {colors} = useContext context

  if isPrimary
    color ?= colors.$primaryMainText
    bgColor ?= colors.$primaryMain
  else if isSecondary
    color ?= colors.$secondaryMainText
    bgColor ?= colors.$secondaryMain
  else
    color ?= colors.$header500Text
    bgColor ?= colors.$header500

  z 'header.z-app-bar', {
    className: classKebab {isFlat, hasLogo}
  },
    z '.bar', {
      style:
        backgroundColor: bgColor
    },
      z '.top',
        if $topLeftButton
          z '.top-left-button', {
            style:
              color: color
          },
            $topLeftButton
        z 'h1.title', {
          style:
            color: color
        },
          if hasLogo
            [
              # z '.icon'
              z '.span.logo-tech', 'tech'
              z '.span.logo-by', 'by'
            ]
          else
            title
        z '.top-right-button', {
          style:
            color: color
        },
          $topRightButton
