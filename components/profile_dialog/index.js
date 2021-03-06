import { z, classKebab, useContext, useEffect, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $avatar from '../avatar'
import $dialog from '../dialog'
import $icon from '../icon'
import { closeIconPath } from '../icon/paths'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

// TODO: if using this with organization/groupStream, get it from context
export default function $profileDialog (props) {
  const { userStreamy, organizationUserStream } = props
  const { model, router, browser, lang, colors } = useContext(context)

  const {
    isVisibleStream, loadingItemsStream, meStream, userStream,
    expandedItemsStream
  } = useMemo(() => {
    const meStream = model.user.getMe()
    const userStream = userStreamy?.pipe ? userStreamy : Rx.of(user)
    return {
      isVisibleStream: new Rx.BehaviorSubject(false),
      loadingItemsStream: new Rx.BehaviorSubject([]),
      expandedItemsStream: new Rx.BehaviorSubject([]),
      meStream,
      userStream
      // organizationAndMeStream: Rx.combineLatest(
      //   organizationStream || Rx.of(null),
      //   meStream,
      //   (...vals) => vals),
      // organizationAndUserStream: Rx.combineLatest(
      //   organizationStream || Rx.of(null),
      //   userStream,
      //   (...vals) => vals)
    }
  }, [])

  useEffect(() => {
    isVisibleStream.next(true)
    return () => isVisibleStream.next(false)
  }, [])

  const {
    me, $links, user, organizationUser, isVisible, organization, loadingItems, windowSize,
    expandedItems
  } = useStream(() => ({
    me: meStream,
    $links: userStream.pipe(rx.map(user => _.filter(_.map(user?.links, function (link, type) {
      if (link) {
        return {
          type,
          link
        }
      }
    })))),
    // meOrganizationUser: organizationAndMeStream.pipe(rx.switchMap(function (...args) {
    //   let organization, me;
    //   [organization, me] = Array.from(args[0])
    //   if (organization && me) {
    //     return model.organizationUser.getByOrganizationIdAndUserId(organization.id, me.id)
    //   } else {
    //     return Rx.of(null)
    //   }
    // })),
    user: userStream,
    organizationUser: organizationUserStream,
    isVisible: isVisibleStream,
    organization,
    loadingItems: loadingItemsStream,
    expandedItems: expandedItemsStream,
    windowSize: browser.getSize()
  }))

  const isLoadingByText = text => loadingItems.indexOf(text) !== -1

  const setLoadingByText = text => loadingItemsStream.next(loadingItems.concat([text]))

  function unsetLoadingByText (text) {
    loadingItems.splice(loadingItems.indexOf(text), 1)
    return loadingItemsStream.next(loadingItems)
  }

  function getUserOptions () {
    // const isBlocked = model.userBlock.isBlocked(blockedUserIds, user?.id)

    // const isMe = user?.id === me?.id

    return _.filter([
      {
        icon: 'profile',
        text: lang.get('general.profile'),
        isVisible: true,
        onclick: () => {
          if (user?.username) {
            return router.go('profile', { username: user?.username })
          } else {
            return router.go('profileById', { id: user?.id })
          }
        }
      },
      {
        icon: 'profile',
        text: isLoadingByText(lang.get('general.profile'))
          ? lang.get('general.loading')
          : lang.get('general.profile'),
        isVisible: true,
        onclick: () => {
          // TODO
          unsetLoadingByText(true)
          setLoadingByText(true)
        }
      }
    ])
  }

  function renderItem (options) {
    const { icon, text, onclick, children, isVisible } = options

    if (!isVisible) {
      return
    }

    const hasChildren = !_.isEmpty(children)
    const isExpanded = expandedItems.indexOf(text) !== -1

    return z('li.menu-item', {
      onclick () {
        let expandedItems
        if (hasChildren && isExpanded) {
          expandedItems = _.clone(expandedItems)
          expandedItems.splice(expandedItems.indexOf(text), 1)
          return expandedItemsStream.next(expandedItems)
        } else if (hasChildren) {
          return expandedItemsStream.next(expandedItems.concat([text]))
        } else {
          return onclick()
        }
      }
    }, [
      z('.menu-item-link', [
        z('.icon',
          z($icon, {
            icon,
            color: colors.$primaryMain
          })),
        z('.text', text),
        !_.isEmpty(children) &&
          z('.chevron', [
            z($icon, {
              icon: isExpanded ? 'chevron-up' : 'chevron-down',
              color: colors.$bgText70
            })
          ])
      ]),
      isExpanded && z('ul.menu', _.map(children, renderItem))
    ])
  }

  // const isMe = user?.id === me?.id

  const userOptions = getUserOptions()

  return z('.z-profile-dialog', {
    className: classKebab({ isVisible: me && user && isVisible })
  }, [
    z($dialog, {
      onClose () {
        return null
      },
      $content:
          z('.z-profile-dialog_dialog', {
            style: {
              maxHeight: `${windowSize.height}px`
            }
          }, [
            z('.header', [
              z('.avatar', [
                z($avatar, { user, bgColor: colors.$bgText12, size: '72px' })
              ]),
              z('.about', [
                z('.name', model.user.getDisplayName(user)),
                !_.isEmpty(organizationUser?.roleNames) &&
                  z('.roles', organizationUser?.roleNames.join(', ')),
                z('.links',
                  _.map($links, ({ link, type }) =>
                    router.link(z('a.link', {
                      href: link,
                      target: '_system',
                      rel: 'nofollow'
                    }, [
                      z($icon, {
                        icon: type,
                        size: '18px',
                        color: colors.$primaryMain
                      })
                    ]))
                  )
                )
              ]),
              z('.close', [
                z('.icon', [
                  z($icon, {
                    icon: closeIconPath,
                    color: colors.$primaryMain,
                    isAlignedTop: true,
                    isAlignedRight: true,
                    onclick () {
                      return null
                    }
                  })
                ])
              ])
            ]), // TODO: close
            z('ul.menu', _.map(userOptions, renderItem))
          ])
    })
  ])
}
