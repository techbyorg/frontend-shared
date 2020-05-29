import {z, classKebab, useContext, useMemo, useStream} from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'

import $tabs from '../tabs'
import $icon from '../icon'
import colors from '../../colors'
import context from '../../context'
import config from '../../config'

if window?
  require './index.styl'

export default $slideSteps = ({onSkip, onDone, steps, doneText}) ->
  {lang} = useContext context

  {selectedIndexStream} = useMemo ->
    {
      selectedIndexStream: new Rx.BehaviorSubject 0
    }
  , []

  {selectedIndex} = useStream ->
    selectedIndex: selectedIndexStream

  z '.p-slide-steps',
    z $tabs, {
      selectedIndex
      hideTabBar: true
      isBarFixed: false
      tabs: _.map steps, ({$content}, i) ->
        {
          $menuText: "#{i}"
          $el: $content
        }
    }

    z '.bottom-bar', [
      # z '.icon',
      #   if selectedIndex > 0
      #     z $icon,
      #       icon: 'back'
      #       color: colors.$bgText
      #       onclick: ->
      #         selectedIndex.next Math.max(selectedIndex - 1, 0)
      if selectedIndex is 0 and onSkip
        z '.text', {
          onclick: onSkip
        },
          lang.get 'general.skip'
      else if selectedIndex
        z '.text', {
          onclick: ->
            selectedIndex.next Math.max(selectedIndex - 1, 0)
        },
          lang.get 'general.back'
      else
        z '.text'
      z '.step-counter',
        _.map steps, (step, i) ->
          isActive = i is selectedIndex
          z '.step-dot',
            className: classKebab {isActive}
      # z '.icon',
      #   if selectedIndex < steps?.length - 1
      #     z $icon,
      #       icon: 'arrow-right'
      #       color: colors.$bgText
      #       onclick: ->
      #         selectedIndex.next \
      #           Math.min(selectedIndex + 1, steps?.length - 1)
      if selectedIndex < steps?.length - 1
        z '.text', {
          onclick: ->
            selectedIndex.next \
              Math.min(selectedIndex + 1, steps?.length - 1)
        },
          lang.get 'general.next'
      else
        z '.text', {
          onclick: onDone
        },
          doneText or lang.get 'general.gotIt'
    ]
