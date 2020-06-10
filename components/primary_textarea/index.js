let $primaryTextarea;
import {z, useContext} from 'zorium';
import * as _ from 'lodash-es';

import $textaea from '../textarea';
import context from '../../context';

export default $primaryTextarea = function(opts) {
  const {colors} = useContext(context);

  return z('.z-primary-textarea',
    z($textarea, _.defaults(opts, {
      isFullWidth: true,
      isRaised: true,
      isFloating: true,
      isDark: true,
      colors: {
        c200: colors.$bgText54,
        c500: colors.$bgText,
        c600: colors.$bgText87,
        c700: colors.$bgText70,
        ink: colors.$bgText
      }
    })));
};
