/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, classKebab, useContext } from 'zorium'

import context from '../../context'
let $appBar

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default $appBar = function (props) {
  let {
    $topLeftButton,
    $topRightButton,
    title,
    bgColor,
    color,
    isRaised,
    isPrimary,
    isSecondary,
    isFullWidth,
    hasLogo
  } = props
  const val = props.isContained
  const isContained = val != null ? val : true
  const { colors } = useContext(context)

  if (isPrimary) {
    if (color == null) { color = colors.$primaryMainText }
    if (bgColor == null) { bgColor = colors.$primaryMain }
  } else if (isSecondary) {
    if (color == null) { color = colors.$secondaryMainText }
    if (bgColor == null) { bgColor = colors.$secondaryMain }
  } else {
    if (color == null) { color = colors.$header500Text }
    if (bgColor == null) { bgColor = colors.$header500 }
  }

  return z('header.z-app-bar', {
    className: classKebab({ isRaised, isContained, hasLogo })
  },
  z('.bar', {
    style: {
      backgroundColor: bgColor
    }
  },
  z('.top',
    $topLeftButton
      ? z('.top-left-button', {
        style: {
          color
        }
      },
      $topLeftButton) : undefined,
    z('h1.title', {
      style: {
        color
      }
    },
    hasLogo
      ? [
        // z '.icon'
        z('.span.logo-tech', 'Fundraise'),
        z('.span.logo-by', 'byTechBy')
      ]
      : title
    ),
    z('.top-right-button', {
      style: {
        color
      }
    },
    $topRightButton)
  )
  )
  )
}
