import {z, classKebab, useMemo, useStream, useRef} from 'zorium'
import * as _ from 'lodash-es'

import $tag from '../tag'
import useRefSize from '../../services/use_ref_size'

if window?
  require './index.styl'

TAG_WIDTH = 150

export default $tags = (props) ->
  {fitToContent, size, tags, maxVisibleCount, isNoWrap = true} = props

  if fitToContent
    $$ref = useRef()
    size ?= useRefSize $$ref

  if isNoWrap
    maxVisibleCount ?= Math.round size?.width / TAG_WIDTH

  more = tags?.length - maxVisibleCount
  tags = _.take(tags, maxVisibleCount)

  if not isNoWrap and fitToContent
    tagChunks = _.chunk tags, Math.round size?.width / TAG_WIDTH

  # TODO: get width, show +X if it goes past width
  z '.z-tags', {
    ref: $$ref
    className: classKebab {isNoWrap}
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
