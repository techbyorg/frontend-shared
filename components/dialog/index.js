let $dialog;
import {z, classKebab, createPortal, useContext, useEffect, useMemo, useRef} from 'zorium';

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl');
}

import $button from '../button';
import $icon from '../icon';
import {closeIconPath} from '../icon/paths';
import context from '../../context';

const CLOSE_DELAY_MS = 450; // 0.45s for animation

export default $dialog = function(props) {
  const {
          onClose
        } = props,
        val = props.$content,
        $content = val != null ? val : '',
        {
          $title,
          $actions,
          isWide
        } = props;
  const {colors} = useContext(context);

  const $$ref = useRef();

  const {$$overlays} = useMemo(() => ({
    $$overlays: document?.getElementById('overlays-portal')
  })
  , []);

  useEffect(function() {
    setTimeout((() => $$ref.current.classList.add('is-mounted')), 0);
    window.addEventListener('keydown', keyListener);

    return () => window.removeEventListener('keydown', keyListener);
  }
  , []);

  const close = function() {
    $$ref.current.classList.remove('is-mounted');
    return setTimeout(() => onClose()
    , CLOSE_DELAY_MS);
  };

  var keyListener = function(e) {
    if ((e.key === 'Escape') || (e.key === 'Esc') || (e.keyCode === 27)) {
      e.preventDefault();
      return close();
    }
  };

  return createPortal(
    z('.z-dialog', {
      ref: $$ref,
      className: classKebab({isWide})
    },
      z('.backdrop', {
        onclick: close
      }),

      z('.dialog',
        $title ?
          z('.title',
            $title,
            z('.close',
              z($icon, {
                icon: closeIconPath,
                color: colors.$bgText26,
                onclick: close
              }))) : undefined,
        z('.content',
          $content),
        $actions ?
          z('.actions', $actions) : undefined
      )
    ),
    $$overlays
  );
};
