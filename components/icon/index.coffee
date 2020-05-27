{z, classKebab} = require 'zorium'

icons = require './icons'
colors = require '../../colors'

if window?
  require './index.styl'

module.exports = $icon = (props) ->
  {icon, size, isAlignedTop, isAlignedLeft, isAlignedRight,
    isAlignedBottom, isTouchTarget, color, onclick, onmousedown,
    viewBox, heightRatio, hasRipple,
    touchHeight, touchWidth} = props

  size ?= '24px'
  viewBox ?= 24
  heightRatio ?= 1
  isTouchTarget ?= true
  touchWidth ?= '48px'
  touchHeight ?= '48px'
  isClickable = Boolean onclick or onmousedown

  tag = if hasRipple then 'a' else 'div'

  z "#{tag}.z-icon", {
    className: classKebab {
      isAlignedTop, isAlignedLeft, isAlignedRight,
      isAlignedBottom, isTouchTarget, isClickable
      hasRippleWhite: hasRipple and color isnt colors.$header500Icon
      hasRippleHeader: hasRipple and color is colors.$header500Icon
    }
    tabindex: if hasRipple then tabindex: 0 else undefined
    onclick: onclick
    onmousedown: onmousedown
    style:
      minWidth: if isTouchTarget then touchWidth else '100%'
      minHeight: if isTouchTarget then touchHeight else '100%'
      width: size
      height: if size?.indexOf?('%') isnt -1 \
              then "#{parseInt(size) * heightRatio}%" \
              else "#{parseInt(size) * heightRatio}px"
  },
    z 'svg', {
      namespace: 'http://www.w3.org/2000/svg'
      viewBox: "0 0 #{viewBox} #{viewBox * heightRatio}"
      style:
        width: size
        height: if size?.indexOf?('%') isnt -1 \
                then "#{parseInt(size) * heightRatio}%" \
                else "#{parseInt(size) * heightRatio}px"
    },
      z 'path', {
        namespace: 'http://www.w3.org/2000/svg'
        d: icons[icon]
        fill: color
        'fill-rule': 'evenodd'
      }
