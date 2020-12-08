import { z, useContext, useMemo, useStream } from 'zorium'

import $avatar from '../avatar'
import $icon from '../icon'
import { settingsIconPath } from '../icon/paths'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $appBarUserMenu () {
  const { model, colors, router } = useContext(context)

  const { meStream, orgStream } = useMemo(() => {
    return {
      meStream: model.user.getMe(),
      orgStream: model.org.getMe()
    }
  }, [])

  const { me, org } = useStream(() => ({
    me: meStream,
    org: orgStream
  }))

  const hasEditUsersPermission = model.orgUser.hasPermission({
    orgUser: org?.orgUser,
    sourceType: 'users',
    permissions: ['edit']
  })

  console.log('me', me)

  return z('.z-app-bar-user-menu', [
    hasEditUsersPermission && z('.icon', z($icon, {
      icon: settingsIconPath,
      color: colors.$bgText60,
      isTouchTarget: true,
      onclick: () => {
        router.go('orgSettings')
      }
    })),
    z($avatar, { user: me })
  ])
}

$appBarUserMenu.propTypes = {}
