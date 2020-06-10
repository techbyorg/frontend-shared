import {z, classKebab, useRef, useLayoutEffect, useStream} from 'zorium'

import $icon from '../icon'

if window?
  require './index.styl'

export default $searchInput = ({icon, placeholder, valueStream}) ->
  {value} = useStream ->
    value: valueStream

  z '.z-input', {
    className: classKebab {hasIcon: icon}
  },
    z 'input.input',
      placeholder: placeholder
      value: value
      oninput: (e) ->
        valueStream.next e.target.value
    if icon
      z '.icon',
        z $icon,
          icon: icon


