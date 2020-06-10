let $sheet;
import {z, createPortal, useRef, useMemo, useEffect} from 'zorium';

import $icon from '../icon';
import $button from '../button';

const CLOSE_DELAY_MS = 450; // 0.45s for animation

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl');
}

export default $sheet = function(props) {
  const {onClose, $content, $actions} = props;

  const $$ref = useRef();

  const {$$overlays} = useMemo(() => ({
    $$overlays: document?.getElementById('overlays-portal')
  })
  , []);

  useEffect(() => setTimeout((() => $$ref.current?.classList.add('is-mounted')), 0)
  , []);

  const close = function() {
    $$ref.current?.classList.remove('is-mounted');
    return setTimeout(() => onClose()
    , CLOSE_DELAY_MS);
  };

  return createPortal(
    z('.z-sheet', {
      ref: $$ref
    },
      z('.backdrop',
        {onclick: close}),
      z('.sheet',
        z('.inner',
          $content,
          $actions ?
            z('.actions', $actions) : undefined
        )
      )
    ),
  $$overlays
  );
};
