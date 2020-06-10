// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let $drawer, IScroll;
import {z, classKebab, useContext, useRef, useStream, useEffect, useMemo} from 'zorium';
import * as rx from 'rxjs/operators';

import context from '../../context';

if (typeof window !== 'undefined' && window !== null) {
  IScroll = require('iscroll/build/iscroll-lite-snap-zoom.js');
  require('./index.styl');
}

const MAX_OVERLAY_OPACITY = 0.5;

// FIXME: store iScrollContainer in state??

export default $drawer = function(props) {
  let transformProperty;
  let {
        isOpenStream,
        onOpen,
        onClose
      } = props,
      val = props.side,
      side = val != null ? val : 'left',
      val1 = props.key,
      key = val1 != null ? val1 : 'nav',
      {
        isStaticStream,
        $content,
        hasAppBar
      } = props;
  const {model, browser, config, colors} = useContext(context);


  const $$ref = useRef();

  ({transformProperty, isStaticStream} = useMemo(() => ({
    transformProperty: browser.getTransformProperty(),

    isStaticStream: isStatic || (browser.getBreakpoint().pipe(
      rx.map(breakpoint => ['desktop'].includes(breakpoint)),
      rx.publishReplay(1),
      rx.refCount()
    ))
  })
  , []));

  var {isOpen, windowSize, appBarHeight,
    drawerWidth, isStatic, breakpoint} = useStream(() => ({
    isOpen: isOpenStream,
    isStatic: isStaticStream,
    windowSize: browser.getSize(),
    breakpoint: browser.getBreakpoint(),
    appBarHeight: browser.getAppBarHeightVal(),
    drawerWidth: browser.getDrawerWidth()
  }));

  useEffect(function() {
    const onStaticChange = isStatic => // sometimes get cannot get length of undefined for gotopage with this
    setTimeout(function() {
      if (!iScrollContainer && !isStatic) {
        function checkIsReady() {
          const $$container = $$ref;
          if ($$container && $$container.clientWidth) {
            return initIScroll($$container);
          } else {
            return setTimeout(checkIsReady, 1000);
          }
        }

        return checkIsReady();
      } else if (iScrollContainer && isStatic) {
        open(0);
        iScrollContainer?.destroy();
        delete iScrollContainer;
        return disposable?.unsubscribe();
      }
    }, 0);
    const isStaticDisposable = isStaticStream.subscribe(onStaticChange);

    return function() {
      iScrollContainer?.destroy();
      delete iScrollContainer;
      disposable?.unsubscribe();
      return isStaticDisposable?.unsubscribe();
    };
  }
  , []);


  function close(animationLengthMs) {
    if (animationLengthMs == null) { animationLengthMs = 500; }
    try {
      if (side === 'right') {
        return iScrollContainer.goToPage(0, 0, animationLengthMs);
      } else {
        return iScrollContainer.goToPage(1, 0, animationLengthMs);
      }
    } catch (err) {
      return console.log('caught err', err);
    }
  }

  function open(animationLengthMs) {
    if (animationLengthMs == null) { animationLengthMs = 500; }
    try {
      if (side === 'right') {
        return iScrollContainer.goToPage(1, 0, animationLengthMs);
      } else {
        return iScrollContainer.goToPage(0, 0, animationLengthMs);
      }
    } catch (err) {
      return console.log('caught err', err);
    }
  }

  function initIScroll($$container) {
    const iScrollContainer = new IScroll($$container, {
      scrollX: true,
      scrollY: false,
      eventPassthrough: true,
      bounce: false,
      snap: '.tab',
      deceleration: 0.002
    });

    const disposable = isOpenStream.subscribe(function(isOpen) {
      if (isOpen) { open(); } else { close(); }
      const $$overlay = $$ref.current.querySelector('.overlay-tab');
      return updateOpacity();
    });

    let isScrolling = false;
    iScrollContainer.on('scrollStart', function() {
      isScrolling = true;
      const $$overlay = $$ref.current.querySelector('.overlay-tab');

      function update() {
        updateOpacity();
        if (isScrolling) {
          return window.requestAnimationFrame(update);
        }
      }

      update();
      return updateOpacity();
    });

    return iScrollContainer.on('scrollEnd', function() {
      isScrolling = false;

      const openPage = side === 'right' ? 1 : 0;

      const newIsOpen = iScrollContainer.currentPage.pageX === openPage;

      // landing on new tab
      if (newIsOpen && !isOpen) {
        return onOpen();
      } else if (!newIsOpen && isOpen) {
        return onClose();
      }
    });
  }

  // the scroll listener in IScroll (iscroll-probe.js) is really slow
  function updateOpacity() {
    let opacity;
    if (side === 'right') {
      opacity = (-1 * iScrollContainer.x) / drawerWidth;
    } else {
      opacity = 1 + (iScrollContainer.x / drawerWidth);
    }

    return $$overlay.style.opacity = opacity * MAX_OVERLAY_OPACITY;
  }

  // HACK: isStatic is null on first render for some reason
  // FIXME: is this still the case w/ zorium 3?
  if (isStatic == null) { isStatic = breakpoint === 'desktop'; }

  let {
    height
  } = windowSize;
  if (hasAppBar && isStatic) {
    height -= appBarHeight;
  }

  const x = (side === 'right') || isStatic ? 0 : -drawerWidth;

  const $drawerTab =
    z('.drawer-tab.tab',
      z('.drawer', {
        style: {
          width: `${drawerWidth}px`
        }
      },
        $content)
    );

  const $overlayTab =
    z('.overlay-tab.tab', {
      onclick() {
        return onClose();
      }
    },
      z('.grip'));

  return z('.z-drawer', {
    rel: $$ref,
    className: classKebab({isOpen, isStatic, isRight: side === 'right'}),
    key: `drawer-${key}`,
    style: {
      display: windowSize.width ? 'block' : 'none',
      height: `${height}px`,
      width: !isStatic 
             ? '100%' 
             : `${drawerWidth}px`
    }
  },
    z('.drawer-wrapper', {
      style: {
        width: `${drawerWidth + windowSize.width}px`,
        // make sure drawer is hidden before js laods
        [transformProperty]:
          `translate(${x}px, 0px) translateZ(0px)`
      }
    },
      side === 'right' ?
        [$overlayTab, $drawerTab]
      :
        [$drawerTab, $overlayTab]));
};
