import {z, classKebab, useContext, useMemo, useStream} from 'zorium'
import * as _ from 'lodash-es'
RxObservable = require('rxjs/Observable').Observable
require 'rxjs/add/observable/combineLatest'

import $icon from '../icon'
import colors from '../../colors'
import context from '../../context'
import config from '../../config'

if window?
  require './index.styl'

module.exports = $bottomBar = ({requestsStream, isAbsolute}) ->
  {model, router, browser, lang} = useContext context

  # don't need to slow down server-side rendering for this
  {hasUnreadMessagesStream} = useMemo ->
    {
      hasUnreadMessagesStream: if window?
        model.conversation.getAll().map (conversations) ->
           _.some conversations, {isRead: false}
      else
        RxObservable.of null
    }
  , []

  {me, hasUnreadMessagesStream, currentPath} = useStream ->
    me: model.user.getMe()
    hasUnreadMessages: hasUnreadMessagesStream
    currentPath: requestsStream.map ({req}) ->
      req.path

  userAgent = browser.getUserAgent()

  menuItems = [
    {
      icon: 'give'
      route: router.get 'give'
      text: lang.get 'general.give'
      isDefault: true
    }
    {
      icon: 'chat'
      route: router.get 'social'
      text: lang.get 'general.community'
      hasNotification: hasUnreadMessagesStream
    }
    {
      icon: 'calendar'
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
            isTouchTarget: false
        z '.text', text
