import { z, useMemo } from 'zorium'
import * as rx from 'rxjs/operators'

import $appBar from 'frontend-shared/components/app_bar'
import $appBarUserMenu from 'frontend-shared/components/app_bar_user_menu'

import $settings from '../../components/settings'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $settingsPage ({ requestsStream }) {
  const { currentTabStream } = useMemo(() => {
    return {
      currentTabStream: requestsStream.pipe(
        rx.map(({ route }) => route.params.tab)
      )
    }
  }, [])

  return z('.p-settings',
    z($appBar, {
      hasLogo: true,
      isContained: false,
      $topRightButton: z($appBarUserMenu)
    }),
    z($settings, { currentTabStream })
  )
}
