{z, classKebab, useContext, useMemo, useStream} = require 'zorium'
_map = require 'lodash/map'
RxBehaviorSubject = require('rxjs/BehaviorSubject').BehaviorSubject

$tabs = require '../tabs'
$icon = require '../icon'
colors = require '../../colors'
context = require '../../context'
config = require '../../config'

if window?
  require './index.styl'

module.exports = $slideSteps = ({onSkip, onDone, steps, doneText}) ->
  {lang} = useContext context

  {selectedIndexStream} = useMemo ->
    {
      selectedIndexStream: new RxBehaviorSubject 0
    }
  , []

  {selectedIndex} = useStream ->
    selectedIndex: selectedIndexStream

  z '.p-slide-steps',
    z $tabs, {
      selectedIndex
      hideTabBar: true
      isBarFixed: false
      tabs: _map steps, ({$content}, i) ->
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
        _map steps, (step, i) ->
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
