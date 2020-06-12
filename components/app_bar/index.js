import { z, classKebab, useContext } from 'zorium'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $appBar (props) {
  const {
    $topLeftButton, $topRightButton, title, isRaised,
    isPrimary, isSecondary, hasLogo, isContained = true
  } = props
  let { color, bgColor } = props
  const { colors } = useContext(context)

  if (isPrimary) {
    color = color || colors.$primaryMainText
    bgColor = bgColor || colors.$primaryMain
  } else if (isSecondary) {
    color = color || colors.$secondaryMainText
    bgColor = bgColor || colors.$secondaryMain
  } else {
    color = color || colors.$header500Text
    bgColor = bgColor || colors.$header500
  }

  return z('header.z-app-bar', {
    className: classKebab({ isRaised, isContained, hasLogo })
  }, [
    z('.bar', { style: { backgroundColor: bgColor } }, [
      z('.top',
        $topLeftButton &&
          z('.top-left-button', { style: { color } }, $topLeftButton),
        z('h1.title', { style: { color } },
          hasLogo
            ? [
              // z '.icon'
              z('.span.logo-tech', 'Fundraise'),
              z('.span.logo-by', 'byTechBy')
            ]
            : title
        ),
        z('.top-right-button', { style: { color } }, $topRightButton)
      )
    ])
  ])
}
