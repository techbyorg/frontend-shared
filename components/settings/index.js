import { z, useStream } from 'zorium'

import $settingsSidebar from '../settings_sidebar'
import $orgUsers from '../org_users'
import $roles from '../roles'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $settings ({ currentTabStream }) {
  const { currentTab } = useStream(() => ({
    currentTab: currentTabStream
  }))

  let $tab
  switch (currentTab) {
    case 'roles': $tab = $roles; break
    default: $tab = $orgUsers
  }

  console.log('tab', currentTab)

  return z('.z-settings', [
    z('.sidebar', [
      z($settingsSidebar, { currentTabStream })
    ]),
    z($tab)
  ])
}
