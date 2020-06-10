// TODO: replace completely with $input
let $input;
import {z, classKebab, useContext, useMemo, useStream} from 'zorium';
import * as _ from 'lodash-es';
import * as Rx from 'rxjs';
import * as rx from 'rxjs/operators';

import context from '../../context';

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl');
}

export default $input = function(props) {
  let {
        valueStream,
        valueStreams,
        errorStream,
        isFocusedStream,
        colors
      } = props,
      val = props.hintText,
      hintText = val != null ? val : '',
      val1 = props.type,
      type = val1 != null ? val1 : 'text',
      {
        isFloating,
        isRounded,
        isDisabled,
        isFullWidth
      } = props,
      val2 = props.autoCapitalize,
      autoCapitalize = val2 != null ? val2 : true,
      {
        height,
        isDark,
        isCentered,
        disableAutoComplete
      } = props;
  const allColors = useContext(context).colors;

  ({valueStream, errorStream, isFocusedStream} = useMemo(() => ({
    valueStream: valueStream || new Rx.BehaviorSubject(''),
    errorStream: errorStream || new Rx.BehaviorSubject(null),
    isFocusedStream: isFocusedStream || new Rx.BehaviorSubject(false)
  })
  , []));

  const {value, error, isFocused} = useStream(() => ({
    value: valueStreams?.pipe(rx.switchAll()) || valueStream,
    error: errorStream,
    isFocused: isFocusedStream
  }));


  colors = _.defaults(colors, {
    c500: allColors.$bgColor,
    background: allColors.$bgColor,
    underline: allColors.$primaryMain
  });

  return z('.z-input-old', {
    style: {
      height,
      minHeight: height
    },
    className: classKebab({
      isDark,
      isFloating,
      isRounded,
      hasValue: (type === 'date') || (value !== ''),
      isFocused,
      isDisabled,
      isCentered,
      isError: (error != null)
    })
  },
    // style:
    //   backgroundColor: colors.background
    z('.hint', {
      style: {
        color: colors.ink
      }
      // style:
      //   color: if isFocused and not error? \
      //          then colors.c500 else null
    },
      hintText),
    z('input.input', {
      disabled: isDisabled ? true : undefined,
      autocomplete: disableAutoComplete ? 'off' : undefined,
      // hack to get chrome to not autofill
      readonly: disableAutoComplete ? true : undefined,
      autocapitalize: !autoCapitalize ? 'off' : undefined,
      type,
      // FIXME?
      style: `color: ${colors.ink};height: ${height};-webkit-text-fill-color:${colors.ink} !important;-webkit-box-shadow: 0 0 0 30px ${colors.background} inset !important`,
      value: `${value}` || '',
      oninput(e) {
        if (valueStreams) {
          return valueStreams.next(Rx.of(e.target.value));
        } else {
          return valueStream.next(e.target.value);
        }
      },
      onfocus(e) {
        if (disableAutoComplete) {
          e.target.removeAttribute('readonly'); // hack to get chrome to not autofill
        }
        return isFocusedStream.next(true);
      },
      onblur(e) {
        return isFocusedStream.next(false);
      }
    }
    ),
    z('.underline-wrapper',
      z('.underline', {
        style: {
          backgroundColor: isFocused && (error == null) 
                           ? colors.underline || colors.c500 
                           : colors.ink
        }
      }
      )
    ),
    (error != null) ?
      z('.error', error) : undefined
  );
};
