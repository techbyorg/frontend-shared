let $buttonMenu;
import {z, useContext} from 'zorium';

import $icon from '../icon';
import {menuIconPath} from '../icon/paths';
import context from '../../context';

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl');
}

export default $buttonMenu = function(...args) {
  const obj = args[0],
        {
          color,
          onclick
        } = obj,
        val = obj.isAlignedLeft,
        isAlignedLeft = val != null ? val : true;
  const {model, colors} = useContext(context);

  return z('.z-button-menu',
    z($icon, {
      isAlignedLeft,
      icon: menuIconPath,
      color: color || colors.$header500Icon,
      hasRipple: true,
      isTouchTarget: true,
      onclick(e) {
        e.preventDefault();
        if (onclick) {
          return onclick();
        } else {
          return model.drawer.open();
        }
      }
    }
    )
  );
};
