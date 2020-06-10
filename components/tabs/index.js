let $tabs, IScroll;
import {z, classKebab, useContext, useEffect, useMemo, useRef, useStream} from 'zorium';
import * as _ from 'lodash-es';
import * as Rx from 'rxjs';

import $tabsBar from '../../components/tabs_bar';
import context from '../../context';

if (typeof window !== 'undefined' && window !== null) {
  IScroll = require('iscroll/build/iscroll-lite-snap-zoom.js');
  require('./index.styl');
}

const TRANSITION_TIME_MS = 500; // 0.5s

// FIXME: i don't think this will actually unsub mountDisposable?
export default $tabs = function(props) {
  let hideTabBar, isPaused, isPausedStream, selectedIndex;
  let {selectedIndexStream, hideTabBarStream,
    disableDeceleration, deferTabLoads, tabs, barColor, barBgColor,
    barInactiveColor, isBarFixed, isBarFlat, isBarArrow, barTabWidth,
    barTabHeight, windowSize, vDomKey, isPrimary} = props;
  const {browser} = useContext(context);

  const $$ref = useRef();

  ({selectedIndexStream, isPausedStream} = useMemo(() => ({
    selectedIndexStream: selectedIndexStream || new Rx.BehaviorSubject(0),
    isPausedStream: new Rx.BehaviorSubject(false)
  })
  , []));

  const transformProperty = browser.getTransformProperty();
  let transitionTime = TRANSITION_TIME_MS;


  useEffect(function($$ref) {
    const mountDisposable = null;
    const iScrollContainer = null;
    let loadedIndices = [];

    var checkIsReady = function() {
      const $$container = $$ref?.querySelector('.z-tabs > .content > .tabs-scroller');
      if ($$container && $$container.clientWidth) {
        return initIScroll($$container, {
          mountDisposable, iScrollContainer, loadedIndices
        });
      } else {
        return setTimeout(checkIsReady, 1000);
      }
    };

    checkIsReady();

    return function() {
      loadedIndices = [];
      mountDisposable?.unsubscribe();
      return iScrollContainer?.destroy();
    };
  }
  , []);

  ({selectedIndex, hideTabBar, isPaused, windowSize} = useStream(() => ({
    selectedIndex: selectedIndexStream,
    hideTabBar: hideTabBarStream,
    isPaused: isPausedStream,
    windowSize: browser.getSize()
  })));

  // FIXME: have these callable by parent (ref, see checkbox component for ex)
  const disableTransition = () => transitionTime = 0;

  const enableTransition = () => transitionTime = TRANSITION_TIME_MS;

  const toggle = function(mode) {
    if ((mode === 'enable') && isPaused) {
      iScrollContainer?.enable();
      return isPausedStream.next(false);
    } else if ((mode === 'disable') && !isPaused) {
      iScrollContainer?.disable();
      return isPausedStream.next(true);
    }
  };

  var initIScroll = function($$container) {
    let $$selector, mountDisposable, updateSelectorPosition;
    const iScrollContainer = new IScroll($$container, {
      scrollX: true,
      scrollY: false,
      eventPassthrough: true,
      bounce: false,
      snap: '.iscroll-tab',
      // when disabled, bounce anim is done by our transitions and there
      // is no momentum. fast swiping through photo gallery breaks with
      // defaul deceleration
      deceleration: disableDeceleration ? 1 : 0.002
    });

    if (!hideTabBar) {
      $$selector = $el?.querySelector('.z-tabs-bar .selector');
      updateSelectorPosition = function() {
        // updating state and re-rendering every time is way too slow
        let xOffset = -100 * iScrollContainer.pages.length * (
          iScrollContainer.x / iScrollContainer.scrollerWidth
        );
        xOffset = `${xOffset}%`;
        return $$selector && (selector.style[transformProperty] = `translateX(${xOffset})`);
      };
    }

    // the scroll listener in IScroll (iscroll-probe.js) is really slow
    let isScrolling = false;
    iScrollContainer.on('scrollStart', function() {
      isScrolling = true;
      if (!hideTabBar) {
        $$selector = document.querySelector('.z-tabs-bar .selector');
        var update = function() {
          updateSelectorPosition();
          if (isScrolling) {
            return window.requestAnimationFrame(update);
          }
        };
        update();
        return updateSelectorPosition();
      }
    });

    iScrollContainer.on('scrollEnd', function() {
      isScrolling = false;

      const newIndex = iScrollContainer.currentPage.pageX;
      // landing on new tab
      if (selectedIndex !== newIndex) {
        return selectedIndexStream.next(newIndex);
      }
    });

    return mountDisposable = selectedIndexStream.do(function(index) {
      loadedIndices.push(index);
      if (iScrollContainer.pages?.[index]) {
        iScrollContainer.goToPage(index, 0, transitionTime);
      }
      if (!hideTabBar) {
        $$selector = document.querySelector('.z-tabs-bar .selector');
        return updateSelectorPosition();
      }
    }).subscribe();
  };

  if (tabs == null) { tabs = [{$el: ''}]; }
  const x = iScrollContainer?.x || (-1 * selectedIndex * (windowSize?.width || 0));

  vDomKey = `${vDomKey}-tabs-${tabs?.length}`;
  if (isBarFixed == null) { isBarFixed = true; }
  if (isBarFlat == null) { isBarFlat = true; }

  return z('.z-tabs', {
    rel: $$ref,
    className: classKebab({isBarFixed}),
    key: vDomKey,
    style: {
      maxWidth: `${windowSize.width}px`
    }
  },
    z('.content',
      !hideTabBar ?
        z('.tabs-bar',
          z($tabsBar, {
            selectedIndexStream,
            isFixed: isBarFixed,
            isFlat: isBarFlat,
            isArrow: isBarArrow,
            tabWidth: barTabWidth,
            tabHeight: barTabHeight,
            color: barColor,
            inactiveColor: barInactiveColor,
            bgColor: barBgColor,
            isPrimary,
            items: tabs
          })) : undefined,
      z('.tabs-scroller', {
        key: vDomKey
      },
        z('.tabs', {
          style: {
            minWidth: `${(100 * tabs.length)}%`,
            // v-dom sometimes changes up the DOM node we're using when the
            // page changes, then back to this page. when that happens,
            // translate x is 0 initially even though iscroll might realize
            // it's actually something other than 0. since iscroll uses
            // css transitions, it causes the page to swipe in, which looks bad
            // This fixes that
            [transformProperty]: `translate(${x}px, 0px) translateZ(0px)`
          }
            // webkitTransform: "translate(#{x}px, 0px) translateZ(0px)"
        },
          _.map(tabs, ({$el}, i) => z('.iscroll-tab', {
            style: {
              width: `${(100 / tabs.length)}%`
            }
          },
            !deferTabLoads || (
              (i === selectedIndex) || (loadedIndices.indexOf(i) !== -1)
            ) ?
              $el : undefined
          ))
        )
      )
    )
  );
};
