import {z} from 'zorium'
import _defaults from 'lodash/defaults'

import $textaea from '../textarea'
import colors from '../../colors'

module.exports = $primaryTextarea = (opts) ->
  z '.z-primary-textarea',
    z $textarea, _defaults opts, {
      isFullWidth: true
      isRaised: true
      isFloating: true
      isDark: true
      colors:
        c200: colors.$bgText54
        c500: colors.$bgText
        c600: colors.$bgText87
        c700: colors.$bgText70
        ink: colors.$bgText
    }
