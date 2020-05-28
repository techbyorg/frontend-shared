import {z, classKebab, useContext, useMemo, useStream} from 'zorium'
import _map from 'lodash/map'
import _uniq from 'lodash/uniq'
RxBehaviorSubject = require('rxjs/BehaviorSubject').BehaviorSubject

import Icon from '../icon'
import Button from '../button'
import Privacy from '../privacy'
import Tos from '../tos'
import Environment from '../../services/environment'
import colors from '../../colors'
import context from '../../context'
import config from '../../config'

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
