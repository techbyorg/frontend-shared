import {z, classKebab, useMemo, useStream, useRef} from 'zorium'
import * as _ from 'lodash-es'

import $tag from '../tag'
import useRefSize from '../../services/use_ref_size'

if window?
  require './index.styl'

TAG_WIDTH = 150

export default $tags = (props) ->
  {fitToContent, size, tags, maxVisibleCount, isWrapped = true} = props

  if fitToContent
    $$ref = useRef()
    size ?= useRefSize $$ref
    if isWrapped
      maxVisibleCount ?= Math.round size?.width / TAG_WIDTH
    else
      console.log size?.width
      tagChunks = _.chunk tags, Math.round size?.width / TAG_WIDTH

  more = tags?.length - maxVisibleCount
  tags = _.take(tags, maxVisibleCount)

  # TODO: get width, show +X if it goes past width
  z '.z-tags', {
    ref: $$ref
    className: classKebab {isWrapped}
  },
    if tagChunks
      _.map tagChunks, (tags, i) ->
        z '.row', [
          _.map tags, (tag) ->
            z $tag, {tag}
          if i is tagChunks.length - 1 and more > 0
            z '.more', "+#{more}"
        ]
    else [
      _.map tags, (tag) ->
        z $tag, {tag}
      if more > 0
        z '.more', "+#{more}"
    ]
