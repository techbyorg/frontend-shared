# not currently used. previously used for cell carrier selection

import {z, classKebab, useStream} from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $checkbox from '../checkbox'

if window?
  require './index.styl'

export default $dropdownMultiple = (props) ->
  {valueStreams, errorStream, optionsStream, isDisabled = false,
    currentText} = props

  {valueStreams, isOpenStream, optionsStream, value} = useMemo ->
    unless options.pipe rx.switchMap
      options = Rx.of options

    valueStreams ?= new Rx.ReplaySubject 1
    valueStreams.next value

    {
      valueStreams
      isOpenStream: new Rx.BehaviorSubject false
      optionsStream: options.pipe rx.map (options) ->
        options = _.map options, (option) ->
          if option.isCheckedStreams
            isCheckedStreams = option.isCheckedStreams
          else
            isCheckedStreams = new Rx.ReplaySubject 1
            isCheckedStreams.next Rx.of false
          {
            option
            isCheckedStreams: isCheckedStreams
          }

      valueStream: options.pipe rx.switchMap (options) ->
        Rx.combineLatest(
          _.map options, ({isCheckedStreams}) ->
            isCheckedStreams.pipe rx.switchAll()
          (vals...) ->
            vals
        )
        .map (values) ->
          _.filter _.map options, ({option}, i) ->
            if values[i]
              option
            else
              null
      }
  , []
  # valueStreams.next Rx.of null

  {value, isOpen, options, error} = useStream ->
    value: valueStreams.pipe rx.switchAll()
    isOpen: isOpenStream
    options: optionsStream
    error: errorStream

  toggle = ->
    isOpenStream.next not isOpen

  z '.z-dropdown-multiple', {
    # vdom doesn't key defaultValue correctly if elements are switched
    # key: _.kebabCase hintText
    className: classKebab {
      hasValue: value isnt ''
      isDisabled
      isOpen
      isError: error?
    }
  },
    z '.wrapper', {
      onclick: ->
        toggle()

    }
    z '.current', {
      onclick: toggle
    },
      currentText
      z '.arrow'
    z '.options',
      _.map options, ({option}) ->
        z 'label.option',
          z '.text',
            option?.text
          z '.checkbox',
            z $checkbox, {onChange: toggle}
    if error?
      z '.error', error
