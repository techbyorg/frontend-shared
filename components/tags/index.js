let $tags;
import {z, classKebab, useMemo, useStream, useRef} from 'zorium';
import * as _ from 'lodash-es';

import $tag from '../tag';
import useRefSize from '../../services/use_ref_size';

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl');
}

const TAG_WIDTH = 150;

export default $tags = function(props) {
  let $$ref, tagChunks;
  let {
        fitToContent,
        size,
        tags,
        maxVisibleCount
      } = props,
      val = props.isNoWrap,
      isNoWrap = val != null ? val : true;

  if (fitToContent) {
    $$ref = useRef();
    if (size == null) { size = useRefSize($$ref); }
  }

  if (isNoWrap) {
    if (maxVisibleCount == null) { maxVisibleCount = Math.round(size?.width / TAG_WIDTH); }
  }

  const more = tags?.length - maxVisibleCount;
  tags = _.take(tags, maxVisibleCount);

  if (!isNoWrap && fitToContent) {
    tagChunks = _.chunk(tags, Math.round(size?.width / TAG_WIDTH));
  }

  // TODO: get width, show +X if it goes past width
  return z('.z-tags', {
    ref: $$ref,
    className: classKebab({isNoWrap})
  },
    tagChunks ?
      _.map(tagChunks, (tags, i) => z('.row', [
        _.map(tags, tag => z($tag, {tag})),
        (i === (tagChunks.length - 1)) && (more > 0) ?
          z('.more', `+${more}`) : undefined
      ]))
    : [
      _.map(tags, tag => z($tag, {tag})),
      more > 0 ?
        z('.more', `+${more}`) : undefined
    ]);
};
