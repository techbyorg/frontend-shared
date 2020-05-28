{z} = require 'zorium'
_defaults = require 'lodash/defaults'

$textaea = require '../textarea'
colors = require '../../colors'

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
