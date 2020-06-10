let $button;
import {z, classKebab, useContext} from 'zorium';

import $ripple from '../ripple';
import $icon from '../icon';
import context from '../../context';

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl');
}

export default $button = function(props) {
  const obj = props || {},
        {
          isPrimary,
          isSecondary,
          isFancy,
          isInverted,
          isDisabled,
          text
        } = obj,
        val = obj.isFullWidth,
        isFullWidth = val != null ? val : true,
        {
          isOutline
        } = obj,
        val1 = obj.onclick,
        onclick = val1 != null ? val1 : () => null,
        val2 = obj.type,
        type = val2 != null ? val2 : 'button',
        {
          icon
        } = obj,
        val3 = obj.heightPx,
        heightPx = val3 != null ? val3 : 36,
        val4 = obj.hasRipple,
        hasRipple = val4 != null ? val4 : true;
  const {colors} = useContext(context);

  return z('.z-button', {
    className: classKebab({
      isFullWidth,
      isOutline,
      isPrimary,
      isSecondary,
      isFancy,
      isInverted,
      isDisabled
    }),
    onclick(e) {
      if (!isDisabled) {
        return onclick(e);
      }
    }
  },

    z('button.button', {
      type,
      disabled: Boolean(isDisabled),
      style: {
        // lineHeight: "#{heightPx}px"
        minHeight: `${heightPx}px`
      }
    },
      icon ?
        z('.icon',
          z($icon, {
          icon,
          color: isPrimary 
                 ? colors.$primaryMainText 
                 : colors.$primaryMain
        }
          )
        ) : undefined,
      text,
      hasRipple ?
        z($ripple,
          {color: isPrimary ? colors.$primaryMainText : colors.$bgText26}) : undefined
    )
  );
};
