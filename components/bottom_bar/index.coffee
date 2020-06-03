import {z, classKebab, useContext, useMemo, useStream} from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $icon from '../icon'
import context from '../../context'

if window?
  require './index.styl'

export default $bottomBar = ({requestsStream, isAbsolute}) ->
  {model, router, browser, lang, colors} = useContext context

  # don't need to slow down server-side rendering for this
  {hasUnreadMessagesStream} = useMemo ->
    {
      hasUnreadMessagesStream: if window?
        model.conversation.getAll().pipe rx.map (conversations) ->
           _.some conversations, {isRead: false}
      else
        Rx.of null
    }
  , []

  {me, hasUnreadMessagesStream, currentPath} = useStream ->
    me: model.user.getMe()
    hasUnreadMessages: hasUnreadMessagesStream
    currentPath: requestsStream.pipe rx.map ({req}) ->
      req.path

  userAgent = browser.getUserAgent()

  menuItems = [
    {
      icon: '' # TODO
      route: router.get 'give'
      text: lang.get 'general.give'
      isDefault: true
    }
    {
      icon: '' # TODO
      route: router.get 'social'
      text: lang.get 'general.community'
      hasNotification: hasUnreadMessagesStream
    }
    {
      icon: '' # TODO
      route: router.get 'events'
      text: lang.get 'general.events'
    }
  ]

  z '.z-bottom-bar', {
    key: 'bottom-bar'
    className: classKebab {isAbsolute}
  },
    _.map menuItems, ({icon, route, text, isDefault, hasNotification}, i) ->
      if isDefault
        isSelected = currentPath is router.get('home') or
          (currentPath and currentPath.indexOf(route) isnt -1)
      else
        isSelected = currentPath and currentPath.indexOf(route) isnt -1

      z 'a.menu-item', {
        tabindex: i
        className: classKebab {isSelected, hasNotification}
        href: route
        onclick: (e) ->
          e?.preventDefault()
          # without delay, browser will wait until the next render is complete
          # before showing ripple. seems better to start ripple animation
          # first
          setTimeout ->
            # skipBlur for iOS so ripple animation works
            router.goPath route, {skipBlur: true}
          , 0
      },
        z '.icon',
          z $icon,
            icon: icon
            color: if isSelected then colors.$primaryMain else colors.$bgText54
        z '.text', text
