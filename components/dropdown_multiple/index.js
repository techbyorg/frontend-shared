// not currently used. previously used for cell carrier selection

let $dropdownMultiple;
import {z, classKebab, useStream} from 'zorium';
import * as _ from 'lodash-es';
import * as Rx from 'rxjs';
import * as rx from 'rxjs/operators';

import $checkbox from '../checkbox';

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl');
}

export default $dropdownMultiple = function(props) {
  let error, isOpen, isOpenStream, options, value;
  let {
        valueStreams,
        errorStream,
        optionsStream
      } = props,
      val = props.isDisabled,
      isDisabled = val != null ? val : false,
      {
        currentText
      } = props;

  ({valueStreams, isOpenStream, optionsStream, value} = useMemo(function() {
    let options;
    if (!options.pipe(rx.switchMap)) {
      options = Rx.of(options);
    }

    if (valueStreams == null) { valueStreams = new Rx.ReplaySubject(1); }
    valueStreams.next(value);

    return {
      valueStreams,
      isOpenStream: new Rx.BehaviorSubject(false),
      optionsStream: options.pipe(rx.map(options => options = _.map(options, function(option) {
        let isCheckedStreams;
        if (option.isCheckedStreams) {
          ({
            isCheckedStreams
          } = option);
        } else {
          isCheckedStreams = new Rx.ReplaySubject(1);
          isCheckedStreams.next(Rx.of(false));
        }
        return {
          option,
          isCheckedStreams
        };
    }))),

      valueStream: options.pipe(rx.switchMap(options => Rx.combineLatest(
        _.map(options, ({isCheckedStreams}) => isCheckedStreams.pipe(rx.switchAll())),
        (...vals) => vals)
      .map(values => _.filter(_.map(options, function({option}, i) {
        if (values[i]) {
          return option;
        } else {
          return null;
        }
      })
      )))
      )
      };
  }
  , []));
  // valueStreams.next Rx.of null

  ({value, isOpen, options, error} = useStream(() => ({
    value: valueStreams.pipe(rx.switchAll()),
    isOpen: isOpenStream,
    options: optionsStream,
    error: errorStream
  })));

  const toggle = () => isOpenStream.next(!isOpen);

  return z('.z-dropdown-multiple', {
    // vdom doesn't key defaultValue correctly if elements are switched
    // key: _.kebabCase hintText
    className: classKebab({
      hasValue: value !== '',
      isDisabled,
      isOpen,
      isError: (error != null)
    })
  },
    z('.wrapper', {
      onclick() {
        return toggle();
      }

    }),
    z('.current', {
      onclick: toggle
    },
      currentText,
      z('.arrow')),
    z('.options',
      _.map(options, ({option}) => z('label.option',
        z('.text',
          option?.text),
        z('.checkbox',
          z($checkbox, {onChange: toggle}))))),
    (error != null) ?
      z('.error', error) : undefined
  );
};
