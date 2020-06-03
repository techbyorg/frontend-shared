import {z, classKebab, useContext, useEffect, useMemo, useStream} from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $avatar from '../avatar'
import $dialog from '../dialog'
import $icon from '../icon'
import {closeIconPath} from '../icon/paths'
import context from '../../context'

if window?
  require './index.styl'

# TODO: if using this with entity/groupStream, get it from context
export default $profileDialog = (props) ->
  {userStreamy, entityUserStream, entityStream} = props
  {model, router, browser, lang, config, colors} = useContext context

  {isVisibleStream, loadingItemsStream, meStream, userStream, entityAndMeStream,
    entityAndUserStream, expandedItemsStream} = useMemo ->

    meStream = model.user.getMe()
    userStream = if userStreamy?.pipe then userStreamy else Rx.of user
    {
      isVisibleStream: new Rx.BehaviorSubject false
      loadingItemsStream: new Rx.BehaviorSubject []
      expandedItemsStream: new Rx.BehaviorSubject []
      meStream
      userStream
      entityAndMeStream: Rx.combineLatest(
        entityStream or Rx.of null
        meStream
        (vals...) -> vals
      )
      entityAndUserStream: Rx.combineLatest(
        entityStream or Rx.of null
        userStream
        (vals...) -> vals
      )
    }
  , []

  useEffect ->
    isVisibleStream.next true
    return ->
      isVisibleStream.next false
  , []

  {me, $links, meEntityUser, user, entityUser, isVisible, entity,
    loadingItems, windowSize} = useStream ->

    me: meStream
    $links: userStream.pipe rx.map (user) ->
      _.filter _.map user?.links, (link, type) ->
        if link
          {
            type: type
            link: link
          }
    meEntityUser: entityAndMeStream.pipe rx.switchMap ([entity, me]) ->
      if entity and me
        model.entityUser.getByEntityIdAndUserId entity.id, me.id
      else
        Rx.of null
    user: userStream
    entityUser: entityUserStream
    isVisible: isVisibleStream
    entity: entity
    loadingItems: loadingItemsStream
    expandedItems: expandedItemsStream
    windowSize: browser.getSize()

  isLoadingByText = (text) ->
    loadingItems.indexOf(text) isnt -1

  setLoadingByText = (text) ->
    loadingItemsStream.next loadingItems.concat [text]

  unsetLoadingByText = (text) ->
    loadingItems = _.clone loadingItems
    loadingItems.splice loadingItems.indexOf(text), 1
    loadingItemsStream.next loadingItems

  getUserOptions = ->
    isBlocked = model.userBlock.isBlocked blockedUserIds, user?.id

    isMe = user?.id is me?.id

    _.filter [
      {
        icon: 'profile'
        text: lang.get 'general.profile'
        isVisible: true
        onclick: ->
          if user?.username
            router.go 'profile', {username: user?.username}
          else
            router.go 'profileById', {id: user?.id}
      }
    ]

  renderItem = (options) ->
    {icon, text, onclick,
      children, isVisible} = options

    unless isVisible
      return

    hasChildren = not _.isEmpty children
    isExpanded = expandedItems.indexOf(text) isnt -1

    z 'li.menu-item', {
      onclick: ->
        if hasChildren and isExpanded
          expandedItems = _.clone expandedItems
          expandedItems.splice expandedItems.indexOf(text), 1
          expandedItemsStream.next expandedItems
        else if hasChildren
          expandedItemsStream.next expandedItems.concat [text]
        else
          onclick()
    },
      z '.menu-item-link',
        z '.icon',
          z $icon, {
            icon: icon
            color: colors.$primaryMain
          }
        z '.text', text
        if not _.isEmpty children
          z '.chevron',
            z $icon,
              icon: if isExpanded \
                    then 'chevron-up' \
                    else 'chevron-down'
              color: colors.$bgText70
      if isExpanded
        z 'ul.menu',
        _.map children, renderItem



  isMe = user?.id is me?.id

  userOptions = getUserOptions()

  z '.z-profile-dialog', {
    className: classKebab {isVisible: me and user and isVisible}
  },
    z $dialog,
      onClose: ->
        null
      $content:
        z '.z-profile-dialog_dialog', {
          style:
            maxHeight: "#{windowSize.height}px"
        },
          z '.header',
            z '.avatar',
              z $avatar, {user, bgColor: colors.$bgText12, size: '72px'}
            z '.about',
              z '.name', model.user.getDisplayName user
              if not _.isEmpty entityUser?.roleNames
                z '.roles', entityUser?.roleNames.join ', '
              z '.links',
                _.map $links, ({link, type}) ->
                  router.link z 'a.link', {
                    href: link
                    target: '_system'
                    rel: 'nofollow'
                  },
                    z $icon, {
                      icon: type
                      size: '18px'
                      color: colors.$primaryMain
                    }
            z '.close',
              z '.icon',
                z $icon,
                  icon: closeIconPath
                  color: colors.$primaryMain
                  isAlignedTop: true
                  isAlignedRight: true
                  onclick: ->
                    null # TODO: close

          z 'ul.menu',
            _.map userOptions, renderItem
