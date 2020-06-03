import {z, classKebab, useContext, useMemo, useStream} from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'

import $icon from '../icon'
import $button from '../button'
import $privacy from '../privacy'
import $tos from '../tos'
import {expandMoreIconPath} from '../icon/paths'
import Environment from '../../services/environment'
import context from '../../context'

if window?
  require './index.styl'

export default $policies = ({isIabStream, $dropdowns}) ->
  {lang, router, config, colors} = useContext context

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
      visibleDropdownsStream: new Rx.BehaviorSubject []
    }
  , []

  {isIab, visibleDropdowns} = useStream ->
    isIab: isIab
    visibleDropdowns: visibleDropdownsStream

  z '.z-policies',
    z '.title', lang.get 'policies.title'
    z '.description',
      lang.get 'policies.description'

    _.map $dropdowns, ($dropdown, i) ->
      {$content, $title} = $dropdown
      isVisible = visibleDropdowns.indexOf(i) isnt -1
      [
        z '.divider'
        z '.dropdown',
          z '.block', {
            onclick: ->
              if isVisible
                visibleDropdownsStream.next _.filter visibleDropdowns, (index) ->
                  index isnt i
              else
                visibleDropdownsStream.next _.uniq visibleDropdowns.concat i
          },
            z '.title', $title
            z '.icon',
              z $icon,
                icon: expandMoreIconPath
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
