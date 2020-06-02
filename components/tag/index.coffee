import {z} from 'zorium'

if window?
  require './index.styl'

export default $tag = ({tag}) ->
  z '.z-tag', {
    style:
      background: tag.background
      color: tag.color
  },
    tag.text
