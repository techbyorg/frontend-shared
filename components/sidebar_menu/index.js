import { z, classKebab, useContext, useStream } from 'zorium'
import * as _ from 'lodash-es'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $sidebarMenu (props) {
  const { title, menuItems, currentMenuItemStream } = props
  const { router } = useContext(context)

  const { currentMenuItem } = useStream(() => ({
    currentMenuItem: currentMenuItemStream
  }))

  console.log('current', currentMenuItemStream)

  return z('.z-sidebar-menu', [
    z('.title', title),
    z('.menu', _.map(menuItems, ({ path, text, menuItem }) => {
      const isSelected = menuItem === currentMenuItem
      return router.linkIfHref(z('.menu-item', {
        href: path,
        onclick: !path && (() => currentMenuItemStream.next(menuItem)),
        className: classKebab({ isSelected })
      }, text))
    }))
  ])
}
