{z, useMemo, useStream, useRef} = require 'zorium'
_map = require 'lodash/map'
_take = require 'lodash/take'

$tag = require '../tag'
useRefSize = require '../../services/use_ref_size'

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
