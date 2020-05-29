import {z, classKebab, useContext, useStream} from 'zorium'
import * as _ from 'lodash-es'

import context from '../../context'

console.log 'why is this running'

if window?
  require './index.styl'

module.exports = $stepBar = (props) ->
  {stepStream, cancel, save, steps, isStepCompleted, isLoading} = props
  {lang} = useContext context

  {step} = useStream ->
    step: stepStream

  cancel = _.defaults cancel, {
    text: if step is 0 and cancel?.onclick \
          then lang.get 'general.cancel'
          else if step > 0
          then lang.get 'general.back'
          else ''
    onclick: -> null
  }
  save = _.defaults save, {
    text: if step is steps - 1 \
          then lang.get 'general.save'
          else lang.get 'general.next'
    onclick: -> null
  }

  z '.z-step-bar',
    z '.previous', {
      onclick: ->
        if step > 0
          step.next step - 1
        else
          cancel.onclick()
    },
      cancel.text

    z '.step-counter',
      _.map _.range(steps), (i) ->
        z '.step-dot',
          className: classKebab {isActive: step is i}

    z '.next', {
      className: classKebab {canContinue: isStepCompleted}
      onclick: ->
        if isStepCompleted
          if step is steps - 1
            save.onclick()
          else
            step.next step + 1
    },
      if isLoading
      then lang.get 'general.loading'
      else save.text
