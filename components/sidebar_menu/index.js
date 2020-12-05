import { z, classKebab, useContext, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'

import $draggable from '../draggable'
import $icon from '../icon'
import { addCircleIconPath, deleteIconPath } from '../icon/paths'
import { streamsOrStream, setStreamsOrStream } from '../../services/obs'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $sidebarMenu (props) {
  const {
    title, subtitle, onAdd, onDelete, menuItems, currentMenuItemStream,
    currentMenuItemStreams, isDraggable, onReorder
  } = props
  const { colors, router } = useContext(context)

  const { isAddLoadingStream, isDeleteLoadingStream } = useMemo(() => {
    return {
      isAddLoadingStream: new Rx.BehaviorSubject(false),
      isDeleteLoadingStream: new Rx.BehaviorSubject(false)
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
        icon: addCircleIconPath,
        size: '22px',
        onclick: async () => {
          isAddLoadingStream.next(true)
          await onAdd()
          isAddLoadingStream.next(false)
        }
      }))
    ]),
    z('.menu', _.map(menuItems, ({ id, path, text, menuItem, isNoDelete }, i) => {
      const isSelected = menuItem === currentMenuItem || (!currentMenuItem && !i)
      const $link = router.linkIfHref(z('.z-sidebar-menu_menu-item', {
        href: path,
        onclick: !path && (() => setStreamsOrStream(
          currentMenuItemStreams, currentMenuItemStream, menuItem
        )),
        className: classKebab({ isSelected })
      }, [
        z('.text', text),
        !isNoDelete && onDelete && z('.delete', z($icon, {
          icon: deleteIconPath,
          size: '20px',
          color: colors.$bgText60,
          onclick: async () => {
            isDeleteLoadingStream.next(true)
            await onDelete(id)
            isDeleteLoadingStream.next(false)
          }
        }))
      ]))
      return isDraggable
        ? z($draggable, { id, onReorder }, $link)
        : $link
    }))
  ])
}
