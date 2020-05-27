{z, classKebab, useContext, useMemo, useStream} = require 'zorium'
_map = require 'lodash/map'
_uniq = require 'lodash/uniq'
RxBehaviorSubject = require('rxjs/BehaviorSubject').BehaviorSubject

Icon = require '../icon'
Button = require '../button'
Privacy = require '../privacy'
Tos = require '../tos'
Environment = require '../../services/environment'
colors = require '../../colors'
context = require '../../context'
config = require '../../config'

if window?
  require './index.styl'

module.exports = $policies = ({isIabStream, $dropdowns}) ->
  {lang, router} = useContext context

  $dropdowns = [
    {
      $title: 'Privacy Policy'
      $content: z $privacy
      isVisible: false
    }
    {
      $title: 'Terms of Service'
      $content: z $tos
      isVisible: false
    }
  ]

  {visibleDropdownsStream} = useMemo ->
    {
      visibleDropdownsStream: new RxBehaviorSubject []
    }
  , []

  {isIab, visibleDropdowns} = useStream ->
    isIab: isIab
    visibleDropdowns: visibleDropdownsStream

  z '.z-policies',
    z '.title', lang.get 'policies.title'
    z '.description',
      lang.get 'policies.description'

    _map $dropdowns, ($dropdown, i) ->
      {$content, $title} = $dropdown
      isVisible = visibleDropdowns.indexOf(i) isnt -1
      [
        z '.divider'
        z '.dropdown',
          z '.block', {
            onclick: ->
              if isVisible
                visibleDropdownsStream.next _filter visibleDropdowns, (index) ->
                  index isnt i
              else
                visibleDropdownsStream.next _uniq visibleDropdowns.concat i
          },
            z '.title', $title
            z '.icon',
              z $icon,
                icon: 'expand-more'
                isTouchTarget: false
                color: colors.$primaryMain
          z '.content', {className: classKebab {isVisible}},
            $content
      ]

    unless isIab
      z '.continue-button',
        z $button,
          text: 'Continue'
          onclick: ->
            router.goPath '/'
