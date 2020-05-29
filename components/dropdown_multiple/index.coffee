# not currently used. previously used for cell carrier selection

import {z, classKebab, useStream} from 'zorium'
import * as _ from 'lodash-es'
RxBehaviorSubject = require('rxjs/BehaviorSubject').BehaviorSubject
RxReplaySubject = require('rxjs/ReplaySubject').ReplaySubject
RxObservable = require('rxjs/Observable').Observable
require 'rxjs/add/observable/combineLatest'
require 'rxjs/add/observable/of'

import $checkbox from '../checkbox'

if window?
  require './index.styl'

module.exports = $dropdownMultiple = (props) ->
  {valueStreams, errorStream, optionsStream, isDisabled = false,
    currentText} = props

  {valueStreams, isOpenStream, optionsStream, value} = useMemo ->
    unless options.switchMap
      options = RxObservable.of options

    valueStreams ?= new RxReplaySubject 1
    valueStreams.next value

    {
      valueStreams
      isOpenStream: new RxBehaviorSubject false
      optionsStream: options.map (options) ->
        options = _.map options, (option) ->
          if option.isCheckedStreams
            isCheckedStreams = option.isCheckedStreams
          else
            isCheckedStreams = new RxReplaySubject 1
            isCheckedStreams.next RxObservable.of false
          {
            option
            isCheckedStreams: isCheckedStreams
          }

      valueStream: options.switchMap (options) ->
        RxObservable.combineLatest(
          _.map options, ({isCheckedStreams}) ->
            isCheckedStreams.switch()
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
  # valueStreams.next RxObservable.of null

  {value, isOpen, options, error} = useStream ->
    value: valueStreams.switch()
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
