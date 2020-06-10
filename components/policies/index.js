let $policies;
import {z, classKebab, useContext, useMemo, useStream} from 'zorium';
import * as _ from 'lodash-es';
import * as Rx from 'rxjs';

import $icon from '../icon';
import $button from '../button';
import $privacy from '../privacy';
import $tos from '../tos';
import {expandMoreIconPath} from '../icon/paths';
import Environment from '../../services/environment';
import context from '../../context';

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl');
}

export default $policies = function({isIabStream, $dropdowns}) {
  const {lang, router, colors} = useContext(context);

  $dropdowns = [
    {
      $title: 'Privacy Policy',
      $content: z($privacy),
      isVisible: false
    },
    {
      $title: 'Terms of Service',
      $content: z($tos),
      isVisible: false
    }
  ];

  const {visibleDropdownsStream} = useMemo(() => ({
    visibleDropdownsStream: new Rx.BehaviorSubject([])
  })
  , []);

  var {isIab, visibleDropdowns} = useStream(() => ({
    isIab,
    visibleDropdowns: visibleDropdownsStream
  }));

  return z('.z-policies',
    z('.title', lang.get('policies.title')),
    z('.description',
      lang.get('policies.description')),

    _.map($dropdowns, function($dropdown, i) {
      const {$content, $title} = $dropdown;
      const isVisible = visibleDropdowns.indexOf(i) !== -1;
      return [
        z('.divider'),
        z('.dropdown',
          z('.block', {
            onclick() {
              if (isVisible) {
                return visibleDropdownsStream.next(_.filter(visibleDropdowns, index => index !== i)
                );
              } else {
                return visibleDropdownsStream.next(_.uniq(visibleDropdowns.concat(i)));
              }
            }
          },
            z('.title', $title),
            z('.icon',
              z($icon, {
                icon: expandMoreIconPath,
                color: colors.$primaryMain
              }
              )
            )
          ),
          z('.content', {className: classKebab({isVisible})},
            $content)
        )
      ];
  }),

    !isIab ?
      z('.continue-button',
        z($button, {
          text: 'Continue',
          onclick() {
            return router.goPath('/');
          }
        }
        )
      ) : undefined
  );
};
