import { z, classKebab, useContext, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'

import $icon from 'frontend-shared/components/icon'
import { addIconPath } from 'frontend-shared/components/icon/paths'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $sidebarMenu (props) {
  const { title, onAdd, menuItems, currentMenuItemStream } = props
  const { router } = useContext(context)

  const { isAddLoadingStream } = useMemo(() => {
    return {
      isAddLoadingStream: new Rx.BehaviorSubject(false)
    }
  })

  const { currentMenuItem } = useStream(() => ({
    currentMenuItem: currentMenuItemStream
  }))

  return z('.z-sidebar-menu', [
    z('.title', [
      z('.text', title),
      onAdd && z('.icon', z($icon, {
        icon: addIconPath,
        onclick: async () => {
          isAddLoadingStream.next(true)
          await onAdd()
          isAddLoadingStream.next(false)
        }
      }))
    ]),
    z('.menu', _.map(menuItems, ({ path, text, menuItem }, i) => {
      const isSelected = menuItem === currentMenuItem ||
        (!currentMenuItem && !i)
      return router.linkIfHref(z('.menu-item', {
        href: path,
        onclick: !path && (() => currentMenuItemStream.next(menuItem)),
        className: classKebab({ isSelected })
      }, text))
    }))
  ])
}
