import { z, classKebab, useContext, useMemo, useStream } from 'zorium'
import PropTypes from 'prop-types'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $appBar (props) {
  const {
    $topLeftButton, $topRightButton, title, isRaised,
    isPrimary, isSecondary, hasLogo, isContained = true
  } = props
  let { color, bgColor } = props
  const { colors, model, lang, router } = useContext(context)

  const { orgStream } = useMemo(() => {
    return {
      orgStream: model.org.getMe()
    }
  }, [])

  const { org } = useStream(() => ({
    org: orgStream
  }))

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

  const logo = org?.slug === 'hackclub'
    ? 'https://assets.hackclub.com/flag-orpheus-top.svg'
    : org?.slug === 'upchieve'
      ? 'https://static1.squarespace.com/static/57c0d8d1e58c622e8b6d5328/t/58e6f7d3cd0f6890d14a989b/1596229917902/?format=600w'
      : org?.slug === 'raisedbyus' && 'https://images.squarespace-cdn.com/content/5a88648ca9db09295b5d7a8c/1518888367733-ME6DC2YQFWXG595E6OGG/RAISEDBY.US_.jpg?format=1500w&content-type=image%2Fjpeg'

  console.log(org, logo, '..............')

  return z('header.z-app-bar', {
    key: 'app-bar',
    className: classKebab({ isRaised, isContained, hasLogo })
  }, [
    z('.bar', { style: { backgroundColor: bgColor } }, [
      z('.top',
        $topLeftButton &&
          z('.top-left-button', { style: { color } }, $topLeftButton),
        hasLogo && z('.logo', {
          style: {
            backgroundImage: logo && `url(${logo})`
          },
          onclick: () => {
            router.go('orgHome')
          }
        }),
        !hasLogo && z('h1.title', {
          style: { color }
        }, title || [
          z('.span.logo-tech', lang.get('appBar.title')),
          z('.span.logo-by', 'byTechBy')
        ]),
        z('.top-right-button', { style: { color } }, $topRightButton)
      )
    ])
  ])
}

$appBar.propTypes = {
  $topLeftButton: PropTypes.node,
  $topRightButton: PropTypes.node,
  title: PropTypes.string,
  isRaised: PropTypes.bool,
  isPrimary: PropTypes.bool,
  isSecondary: PropTypes.bool,
  hasLogo: PropTypes.bool,
  isContained: PropTypes.bool
}
