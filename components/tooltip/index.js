let $tooltip;
import {z, classKebab, useContext, useEffect, useStream} from 'zorium';
import * as _ from 'lodash-es';

import $icon from '../icon';
import {closeIconPath} from '../icon/paths';
import context from '../../context';

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl');
}

// FIXME: use $positionedOverlay
export default $tooltip = function(props) {
  const {$$target, key, anchor, offset, isVisibleStream, zIndex,
    $title, $content} = props;
  const {cookie, colors} = useContext(context);

  const close = function() {
    let completedTooltips = (() => { try {
      return cookie.get('completedTooltips').split(',');
    } catch (error) {
      return [];
    } })();
    if (completedTooltips == null) { completedTooltips = []; }
    cookie.set('completedTooltips', _.uniq(
      completedTooltips.concat([key])
    ).join(',')
    );
    $positionedOverlay.close();

    return isVisibleStream.next(false);
  };
  return z(`.z-tooltip.anchor-${anchor}`, {
    ref: $$target,
    className: classKebab({isVisible}),
    style
  },
    z($positionedOverlay, {
      $content: [
        z('.close',
          z($icon, {
            icon: closeIconPath,
            size: '16px',
            color: colors.$bgText54,
            onclick: close
          }
          )
        ),
        z('.content',
          z('.title', $title),
          $content)
      ]
    }));
};
