import { z, classKebab, useRef } from 'zorium'
import * as _ from 'lodash-es'

import $tag from '../tag'
import useRefSize from '../../services/use_ref_size'

if (typeof window !== 'undefined') { require('./index.styl') }

const TAG_WIDTH = 150

export default function $tags (props) {
  const { fitToContent, isNoWrap = true } = props

  let $$ref, tagChunks, size, maxVisibleCount
  if (fitToContent) {
    $$ref = useRef()
    size = props.size || useRefSize($$ref)
  }

  if (isNoWrap) {
    maxVisibleCount = props.maxVisibleCount ||
                        Math.round(size?.width / TAG_WIDTH)
  }

  const more = props.tags?.length - maxVisibleCount
  const tags = _.take(props.tags, maxVisibleCount)

  if (!isNoWrap && fitToContent) {
    tagChunks = _.chunk(tags, Math.round(size?.width / TAG_WIDTH))
  }

  // TODO: get width, show +X if it goes past width
  return z('.z-tags', {
    ref: $$ref,
    className: classKebab({ isNoWrap })
  }, [
    tagChunks
      ? _.map(tagChunks, (tags, i) => z('.row', [
        _.map(tags, tag => z($tag, { tag })),
        (i === (tagChunks.length - 1)) && (more > 0)
          ? z('.more', `+${more}`) : undefined
      ]))
      : [
        _.map(tags, tag => z($tag, { tag })),
        more > 0
          ? z('.more', `+${more}`) : undefined
      ]
  ])
}
