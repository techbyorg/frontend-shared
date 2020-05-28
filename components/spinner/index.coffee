import {z} from 'zorium'
import _map from 'lodash/map'
import _range from 'lodash/range'

import colors from '../../colors'

if window?
  require './index.styl'

DEFAULT_SIZE = 50

module.exports = $spinner = ({size = DEFAULT_SIZE}) ->
  z '.z-spinner', {
    style:
      width: "#{size}px"
      height: "#{size * 0.6}px"
  },
    _map _range(3), ->
      z 'li',
        style:
          border: "#{Math.round(size * 0.06)}px solid #{colors.$primary500}"
