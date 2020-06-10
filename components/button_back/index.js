let $buttonBack;
import {z, useContext} from 'zorium';

import $icon from '../icon';
import {backIconPath} from '../icon/paths';
import context from '../../context';

export default $buttonBack = function(props) {
  const {
          color,
          onclick,
          fallbackPath
        } = props,
        val = props.isAlignedLeft,
        isAlignedLeft = val != null ? val : true;
  const {router, colors} = useContext(context);

  return z('.z-button-back',
    z($icon, {
      isAlignedLeft,
      icon: backIconPath,
      color: color || colors.$header500Icon,
      hasRipple: true,
      isTouchTarget: true,
      onclick(e) {
        e.preventDefault();
        return setTimeout(function() {
          if (onclick) {
            return onclick();
          } else {
            return router.back({fallbackPath});
          }
        }
        , 0);
      }
    }
    )
  );
};
