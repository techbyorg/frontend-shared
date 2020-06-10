let $stepBar;
import {z, classKebab, useContext, useStream} from 'zorium';
import * as _ from 'lodash-es';

import context from '../../context';

console.log('why is this running');

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl');
}

export default $stepBar = function(props) {
  let {stepStream, cancel, save, steps, isStepCompleted, isLoading} = props;
  const {lang} = useContext(context);

  const {step} = useStream(() => ({
    step: stepStream
  }));

  cancel = _.defaults(cancel, {
    text: (step === 0) && cancel?.onclick 
          ? lang.get('general.cancel')
          : step > 0
          ? lang.get('general.back')
          : '',
    onclick() { return null; }
  });
  save = _.defaults(save, {
    text: step === (steps - 1) 
          ? lang.get('general.save')
          : lang.get('general.next'),
    onclick() { return null; }
  });

  return z('.z-step-bar',
    z('.previous', {
      onclick() {
        if (step > 0) {
          return step.next(step - 1);
        } else {
          return cancel.onclick();
        }
      }
    },
      cancel.text),

    z('.step-counter',
      _.map(_.range(steps), i => z('.step-dot',
        {className: classKebab({isActive: step === i})}))),

    z('.next', {
      className: classKebab({canContinue: isStepCompleted}),
      onclick() {
        if (isStepCompleted) {
          if (step === (steps - 1)) {
            return save.onclick();
          } else {
            return step.next(step + 1);
          }
        }
      }
    },
      isLoading
      ? lang.get('general.loading')
      : save.text
    )
  );
};
