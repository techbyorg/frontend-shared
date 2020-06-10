let $tapTabs;
import {z, classKebab, useContext, useMemo, useStream} from 'zorium';
import * as _ from 'lodash-es';
import * as Rx from 'rxjs';
import * as rx from 'rxjs/operators';

import context from '../../context';

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl');
}

export default $tapTabs = function(props) {
  let {selectedIndexStreams, selectedIndexStream, tabs, tabProps} = props;
  const {router} = useContext(context);

  ({selectedIndexStream} = useMemo(() => ({
    selectedIndexStream: selectedIndexStream || new Rx.BehaviorSubject(0)
  })
  , []));

  const {selectedIndex} = useStream(() => ({
    selectedIndex:
      selectedIndexStreams?.pipe(rx.switchAll()) || selectedIndexStream
  }));

  return z('.z-tap-tabs',
    z('.menu',
      z('.container',
        _.map(tabs, function({name, route}, i) {
          const isSelected = selectedIndex === i;

          return router.linkIfHref(z('.tap-tab', {
            className: classKebab({isSelected}),
            href: route,
            onclick() {
              if (selectedIndexStreams) {
                return selectedIndexStreams.next(Rx.of(i));
              } else {
                return selectedIndexStream.next(i);
              }
            }
          },
            name)
          );
        })
      )
    ),

    z('.current-tab',
      z('.container',
        (selectedIndex != null) ?
          z(tabs[selectedIndex].$el, tabProps) : undefined
      )
    )
  );
};
