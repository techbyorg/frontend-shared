import { z, classKebab, useContext, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'

import $draggable from '../draggable'
import $icon from '../icon'
import { addIconPath } from '../icon/paths'
import { streamsOrStream, setStreamsOrStream } from '../../services/obs'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $sidebarMenu (props) {
  const {
    title, subtitle, onAdd, menuItems, currentMenuItemStream,
    currentMenuItemStreams, isDraggable, onReorder
  } = props
  const { router } = useContext(context)

  const { isAddLoadingStream } = useMemo(() => {
    return {
      isAddLoadingStream: new Rx.BehaviorSubject(false)
    }
  })

  const { currentMenuItem } = useStream(() => ({
    currentMenuItem: streamsOrStream(
      currentMenuItemStreams, currentMenuItemStream
    )
  }))

  return z('.z-sidebar-menu', [
    z('.subtitle', subtitle),
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
    z('.menu', _.map(menuItems, ({ id, path, text, menuItem }, i) => {
      const isSelected = menuItem === currentMenuItem || (!currentMenuItem && !i)
      const $link = router.linkIfHref(z('.z-sidebar-menu_menu-item', {
        href: path,
        onclick: !path && (() => setStreamsOrStream(
          currentMenuItemStreams, currentMenuItemStream, menuItem
        )),
        className: classKebab({ isSelected })
      }, text))
      return isDraggable
        ? z($draggable, { id, onReorder }, $link)
        : $link
    }))
  ])
}
