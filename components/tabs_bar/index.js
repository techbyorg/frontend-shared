let $tabsBar;
import {z, classKebab, useEffect, useRef, useStream} from 'zorium';
import * as _ from 'lodash-es';

import colors from '../../colors';

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl');
}

export default $tabsBar = function(props) {
  let {selectedIndexStream, items, bgColor, color, isPrimary, inactiveColor,
    underlineColor, isFixed, isFlat, isArrow, tabWidth, tabHeight} = props;

  const $$ref = useRef();

  useEffect(function() {
    $$ref.current.addEventListener('touchmove', onTouchMove);

    return () => $$ref?.current.removeEventListener('touchmove', onTouchMove);
  }
  , []);

  const {selectedIndex} = useStream(() => ({
    selectedIndex: selectedIndexStream
  }));

  var onTouchMove = e => e.preventDefault();

  if (bgColor == null) { bgColor = isPrimary ? colors.$primaryMain : colors.$bgColor; }
  if (inactiveColor == null) { inactiveColor = isPrimary 
                   ? colors.$primaryMainText54 
                   : colors.$bgText54; }
  if (color == null) { color = isPrimary 
           ? colors.$primaryMainText 
           : colors.$bgText; }
  if (underlineColor == null) { underlineColor = isPrimary 
                    ? colors.$primaryMainText 
                    : colors.$primaryMain; }

  const isFullWidth = !tabWidth;

  return z('.z-tabs-bar', {
    ref: $$ref,
    className: classKebab({isFixed, isArrow, isFlat, isFullWidth}),
    style: {
      background: bgColor
    }
  },
    z('.bar', {
      style: {
        background: bgColor,
        height: tabHeight ? `${tabHeight}px` : undefined,
        width: isFullWidth 
               ? '100%' 
               : `${tabWidth * items.length}px`
      }
    },
        z('.selector', {
          key: 'selector',
          style: {
            background: underlineColor,
            width: `${100 / items.length}%`
          }
        }
        ),
        _.map(items, function(item, i) {
          const hasIcon = Boolean(item.$menuIcon);
          const hasText = Boolean(item.$menuText);
          const {
            hasNotification
          } = item;
          const isSelected = i === selectedIndex;

          return z('.tab', {
            key: i,
            slug: item.slug,
            className: classKebab({hasIcon, hasText, isSelected}),
            style: tabWidth ? {width: `${tabWidth}px`} : null,

            onclick(e) {
              e.preventDefault();
              e.stopPropagation();
              return selectedIndexStream.next(i);
            }
          },
            hasIcon ?
              z('.icon',
                z(item.$menuIcon, {
                  color: isSelected ? color : inactiveColor,
                  icon: item.menuIconName
                }
                )
              ) : undefined,
            item.$after,
            hasText ?
              z('.text', {
                style: {
                  color: isSelected ? color : inactiveColor
                }
              },
               item.$menuText) : undefined,

             z('.notification', {
               className: classKebab({
                 isVisible: hasNotification
               })
             }));
      })));
};
