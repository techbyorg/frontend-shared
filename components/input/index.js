let $searchInput;
import {z, classKebab, useRef, useLayoutEffect, useStream} from 'zorium';

import $icon from '../icon';

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl');
}

export default $searchInput = function({icon, placeholder, valueStream}) {
  const {value} = useStream(() => ({
    value: valueStream
  }));

  return z('.z-input', {
    className: classKebab({hasIcon: icon})
  },
    z('input.input', {
      placeholder,
      value,
      oninput(e) {
        return valueStream.next(e.target.value);
      }
    }
    ),
    icon ?
      z('.icon',
        z($icon,
          {icon})
      ) : undefined
  );
};


