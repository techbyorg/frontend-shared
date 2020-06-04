import {z, classKebab, useContext} from 'zorium'

import context from '../../context'

if window?
  require './index.styl'

export default $appBar = (props) ->
  {$topLeftButton, $topRightButton, title, bgColor, color, isRaised, isPrimary
    isSecondary, isFullWidth, hasLogo, isContained = true} = props
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
    className: classKebab {isRaised, isContained, hasLogo}
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
              z '.span.logo-tech', 'Fundraise'
              z '.span.logo-by', 'byTechBy'
            ]
          else
            title
        z '.top-right-button', {
          style:
            color: color
        },
          $topRightButton
