import {z} from 'zorium'

if window?
  require './index.styl'

export default $tag = ({tag}) ->
  z '.z-tag', {
    style:
      background: "#{tag.color}10"
      color: tag.color
  },
    tag.text
