let $actionBar;
import {z, useContext} from 'zorium';
import * as _ from 'lodash-es';

import $appBar from '../app_bar';
import $icon from '../icon';
import {ellipsisIconPath} from '../icon/paths';
import context from '../../context';

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl');
}

export default $actionBar = function(props) {
  let color;
  let {title, cancel, save, isSaving, isPrimary, isSecondary} = props;
  const {lang, colors} = useContext(context);

  cancel = _.defaults(cancel, {
    icon: 'close',
    text: lang.get('general.cancel'),
    onclick() { return null; }
  });
  save = _.defaults(save, {
    icon: 'check',
    text: lang.get('general.save')
    // onclick: -> null
  });

  if (isPrimary) {
    color = colors.$primaryMainText;
    // bgColor = colors.$primaryMain
  } else if (isSecondary) {
    color = colors.$secondaryMainText;
    // bgColor = colors.$secondaryMain
  } else {
    color = colors.$header500Icon;
  }
    // bgColor = colors.$header500

  return z('.z-action-bar',
    z($appBar, {
      title,
      isPrimary,
      isSecondary,
      $topLeftButton:
        z(Icon, {
          icon: cancel.icon,
          color,
          hasRipple: true,
          isTouchTarget: true,
          onclick(e) {
            e?.stopPropagation();
            return cancel.onclick(e);
          }
        }
        ),
      $topRightButton:
        save?.onclick ?
          z($icon, {
            icon: isSaving ? ellipsisIconPath : save.icon,
            color,
            hasRipple: true,
            isTouchTarget: true,
            onclick(e) {
              e?.stopPropagation();
              return save.onclick(e);
            }
          }
          ) : undefined,
      isFlat: true
    }));
};
