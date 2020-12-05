import { z, useContext, useStream } from 'zorium'
import * as _ from 'lodash-es'

import $sidebarMenu from '../sidebar_menu'
import $orgUsers from '../org_users'
import $partners from '../partners'
import $roles from '../roles'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $settings ({ currentTabStream, additionalTabs = [] }) {
  const { router, lang } = useContext(context)

  const { currentTab } = useStream(() => ({
    currentTab: currentTabStream
  }))

  const menuItems = [
    {
      menuItem: 'users',
      text: lang.get('general.users'),
      path: router.get('orgSettingsWithTab', { tab: 'users' }),
      $tab: $orgUsers
    },
    {
      menuItem: 'roles',
      text: lang.get('general.roles'),
      path: router.get('orgSettingsWithTab', { tab: 'roles' }),
      $tab: $roles
    },
    {
      menuItem: 'partners',
      text: lang.get('general.partners'),
      path: router.get('orgSettingsWithTab', { tab: 'partners' }),
      $tab: $partners
    }
  ].concat(additionalTabs)

  const $tab = (_.find(menuItems, { menuItem: currentTab }) || menuItems[0]).$tab

  return z('.z-settings', [
    z('.sidebar', [
      z($sidebarMenu, {
        title: lang.get('general.settings'),
        currentMenuItemStream: currentTabStream,
        menuItems
      })
    ]),
    z($tab)
  ])
}
