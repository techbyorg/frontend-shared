import { z, classKebab, useContext } from 'zorium'
import PropTypes from 'prop-types'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $icon (props) {
  const {
    icon, isAlignedTop, isAlignedLeft, isAlignedRight,
    isAlignedBottom, isCircled, color, onclick, onmousedown,
    hasRipple, viewBox = 24, heightRatio = 1
  } = props
  let {
    isTouchTarget, size = '24px', touchWidth = '48px', touchHeight = '48px'
  } = props
  const { colors } = useContext(context)

  const isClickable = Boolean(onclick || onmousedown)

  const tag = hasRipple ? 'a' : 'div'

  if (isCircled) {
    isTouchTarget = isTouchTarget | true
    size = size || '16px'
    touchWidth = touchWidth || '40px'
    touchHeight = touchHeight || '40px'
  }

  return z(`${tag}.z-icon`, {
    className: classKebab({
      isAlignedTop,
      isAlignedLeft,
      isAlignedRight,
      isAlignedBottom,
      isTouchTarget,
      isClickable,
      isCircled,
      hasRippleWhite: hasRipple && (color !== colors.$header500Icon),
      hasRippleHeader: hasRipple && (color === colors.$header500Icon)
    }),
    tabindex: hasRipple ? { tabindex: 0 } : undefined,
    onclick,
    onmousedown,
    style: {
      minWidth: isTouchTarget ? touchWidth : '0', // 100% makes having a wrapper div necessary
      minHeight: isTouchTarget ? touchHeight : '100%', // nec to center
      width: size,
      height: size?.indexOf?.('%') !== -1
        ? `${parseInt(size) * heightRatio}%`
        : `${parseInt(size) * heightRatio}px`
    }
  }, [
    z('svg', {
      namespace: 'http://www.w3.org/2000/svg',
      viewBox: `0 0 ${viewBox} ${viewBox * heightRatio}`,
      style: {
        width: size,
        height: size?.indexOf?.('%') !== -1
          ? `${parseInt(size) * heightRatio}%`
          : `${parseInt(size) * heightRatio}px`
      }
    }, [
      z('path', {
        namespace: 'http://www.w3.org/2000/svg',
        d: icon,
        fill: color,
        'fill-rule': 'evenodd'
      })
    ])
  ])
}

$icon.propTypes = {
  icon: PropTypes.string,
  isAlignedTop: PropTypes.bool,
  isAlignedLeft: PropTypes.bool,
  isAlignedRight: PropTypes.bool,
  isAlignedBottom: PropTypes.bool,
  isCircled: PropTypes.bool,
  color: PropTypes.string,
  size: PropTypes.string,
  onclick: PropTypes.func,
  onmousedown: PropTypes.func,
  hasRipple: PropTypes.bool,
  viewBox: PropTypes.number,
  heightRatio: PropTypes.number,
  isTouchTarget: PropTypes.bool,
  touchWidth: PropTypes.string,
  touchHeight: PropTypes.string
}
