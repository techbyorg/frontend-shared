import { z, classKebab, useContext, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $icon from '../icon'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $bottomBar ({ requestsStream, isAbsolute }) {
  const { model, router, lang, colors } = useContext(context)

  // don't need to slow down server-side rendering for this
  const { hasUnreadMessagesStream } = useMemo(() => {
    return {
      hasUnreadMessagesStream: globalThis?.window
        ? model.conversation.getAll()
          .pipe(
            rx.map(conversations => _.some(conversations, { isRead: false }))
          )
        : Rx.of(null)
    }
  }, [])

  const { currentPath } = useStream(() => ({
    // me: model.user.getMe(),
    // hasUnreadMessages: hasUnreadMessagesStream,
    currentPath: requestsStream.pipe(rx.map(({ req }) => req.path)
    )
  }))

  const menuItems = [
    {
      icon: '', // TODO
      route: router.get('give'),
      text: lang.get('general.give'),
      isDefault: true
    },
    {
      icon: '', // TODO
      route: router.get('social'),
      text: lang.get('general.community'),
      hasNotification: hasUnreadMessagesStream
    },
    {
      icon: '', // TODO
      route: router.get('events'),
      text: lang.get('general.events')
    }
  ]

  return z('.z-bottom-bar', {
    key: 'bottom-bar',
    className: classKebab({ isAbsolute })
  }, _.map(menuItems, (menuItem, i) => {
    const { icon, route, text, isDefault, hasNotification } = menuItem
    let isSelected
    if (isDefault) {
      isSelected = (currentPath === router.get('home')) ||
          (currentPath && (currentPath.indexOf(route) !== -1))
    } else {
      isSelected = currentPath && (currentPath.indexOf(route) !== -1)
    }

    return z('a.menu-item', {
      tabindex: i,
      className: classKebab({ isSelected, hasNotification }),
      href: route,
      onclick: (e) => {
        e?.preventDefault()
        // without delay, browser will wait until the next render is complete
        // before showing ripple. seems better to start ripple animation
        // first
        return setTimeout(() => // skipBlur for iOS so ripple animation works
          router.goPath(route, { skipBlur: true })
        , 0)
      }
    }, [
      z('.icon', [
        z($icon, {
          icon,
          color: isSelected ? colors.$primaryMain : colors.$bgText54
        })
      ]),
      z('.text', text)
    ])
  }))
}
