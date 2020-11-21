import { z, useContext } from 'zorium'

import $sidebarMenu from '../sidebar_menu'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $settingsSidebar ({ currentTabStream }) {
  const { router, lang } = useContext(context)

  const menuItems = [
    {
      menuItem: 'users',
      text: lang.get('general.users'),
      path: router.get('orgSettingsWithTab', { tab: 'users' })
    },
    {
      menuItem: 'roles',
      text: lang.get('general.roles'),
      path: router.get('orgSettingsWithTab', { tab: 'roles' })
    }
    // {
    //   menuItem: 'partners',
    //   text: lang.get('general.partners'),
    //   path: router.get('orgSettingsWithTab', { tab: 'partners' })
    // }
  ]

  return z('.z-settings-sidebar', [
    z($sidebarMenu, {
      title: lang.get('general.settings'),
      currentMenuItemStream: currentTabStream,
      menuItems
    })
  ])
}
