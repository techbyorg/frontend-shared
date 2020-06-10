let $fab;
import {z, useContext, useMemo} from 'zorium';
import * as _ from 'lodash-es';

import $icon from '../icon';
import $ripple from '../ripple';
import context from '../../context';

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl');
}

export default $fab = function(props) {
  const {
          icon,
          colors,
          isPrimary,
          isSecondary,
          onclick,
          isImmediate
        } = props,
        val = props.sizePx,
        sizePx = val != null ? val : 56;
  const allColors = useContext(context).colors;

  const {colorsMemo} = useMemo(colors => ({
    colorsMemo: _.defaults(colors, {
      c500: isPrimary ? allColors.$primaryMain 
            : isSecondary ? allColors.$secondaryMain 
            : allColors.$white,
      cText: isPrimary ? allColors.$primaryMainText 
            : isSecondary ? allColors.$secondaryMainText 
            : allColors.$bgText87,
      ripple: allColors.$white
    })
  })
  , [colors]);

  return z('.z-fab', {
    onclick: isImmediate ? onclick : undefined,
    style: {
      backgroundColor: colorsMemo.c500,
      width: `${sizePx}px`,
      height: `${sizePx}px`
    }
  },
    z('.icon-container',
      z($icon, {
        icon,
        color: colorsMemo.cText
      }
      )
    ),
    z($ripple, {
      onComplete: !isImmediate ? onclick : undefined,
      color: colorsMemo.ripple
    }
    )
  );
};
