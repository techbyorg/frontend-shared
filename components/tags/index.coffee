import {z, useMemo, useStream, useRef} from 'zorium'
import _map from 'lodash/map'
import _take from 'lodash/take'

import $tag from '../tag'
import useRefSize from '../../services/use_ref_size'

if window?
  require './index.styl'

TAG_WIDTH = 150

module.exports = $tags = ({size, tags, maxVisibleCount}) ->
  $$ref = useRef()

  size ?= useRefSize $$ref

  maxVisibleCount ?= Math.ceil size.width / TAG_WIDTH
  more = tags?.length - maxVisibleCount

  # TODO: get width, show +X if it goes past width
  z '.z-tags', {ref: $$ref}, [
    _map _take(tags, maxVisibleCount), (tag) ->
      z $tag, {tag}
    if more > 0
      z '.more', "+#{more}"
  ]
