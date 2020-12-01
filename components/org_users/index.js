// TODO: settings page might be better in frontend-shared
import { z, useContext, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'

import $button from 'frontend-shared/components/button'
import $conditionalVisible from 'frontend-shared/components/conditional_visible'
import $icon from 'frontend-shared/components/icon'
import { editIconPath, deleteIconPath } from 'frontend-shared/components/icon/paths'
import $table from 'frontend-shared/components/table'
import $tags from 'frontend-shared/components/tags'

import $inviteOrgUserDialog from '../invite_org_user_dialog'
import $editOrgUserDialog from '../edit_org_user_dialog'
import $sidebarMenu from '../sidebar_menu'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $settings () {
  const { lang, model } = useContext(context)

  const {
    isInviteOrgUserDialogVisibleStream, editingOrgUserStream,
    editingOrgUserInviteStream, orgUsersStream, orgUserInvitesStream,
    currentMenuItemStream
  } = useMemo(() => {
    return {
      isInviteOrgUserDialogVisibleStream: new Rx.BehaviorSubject(false),
      editingOrgUserStream: new Rx.BehaviorSubject(null),
      editingOrgUserInviteStream: new Rx.BehaviorSubject(null),
      orgUsersStream: model.orgUser.getAll(),
      orgUserInvitesStream: model.orgUserInvite.getAll(),
      currentMenuItemStream: new Rx.BehaviorSubject('all')
    }
  }, [])

  const { orgUsers, orgUserInvites } = useStream(() => ({
    orgUsers: orgUsersStream,
    orgUserInvites: orgUserInvitesStream
  }))

  const menuItems = [
    { menuItem: 'all', text: lang.get('general.all') }
  ]

  return z('.z-org-users',
    z('.sidebar', [
      z($sidebarMenu, {
        title: lang.get('general.users'),
        currentMenuItemStream: currentMenuItemStream,
        menuItems
      })
    ]),
    z('.content', [
      z('.top', [
        z('.left', [
          z('.title', lang.get('general.users')),
          z('.description', lang.get('orgUsers.description'))
        ]),
        z('.right',
          z('.invite-button', [
            z($button, {
              isFullWidth: false,
              // isBgColor: true,
              isBgColor: true,
              text: lang.get('general.invite'),
              onclick: () => {
                isInviteOrgUserDialogVisibleStream.next(true)
              }
            })
          ])
        )
      ]),
      z($table, {
        data: orgUsers?.nodes,
        columns: [
          {
            key: 'user',
            name: lang.get('general.user'),
            // width: 200,
            isFlex: true,
            content ({ row }) {
              return row.user.name
            }
          },
          {
            key: 'email',
            name: lang.get('general.email'),
            width: 250,
            content ({ row }) {
              return row.user.email
            }
          },
          {
            key: 'roles',
            name: lang.get('general.roles'),
            width: 300,
            content ({ row }) {
              return z($tags, {
                maxVisibleCount: 3,
                tags: _.map(row.roles.nodes, ({ name }) => ({ text: name }))
              })
            }
          },
          {
            key: 'partner',
            name: lang.get('general.partner'),
            width: 300,
            content ({ row }) {
              return z($tags, {
                maxVisibleCount: 3,
                tags: _.map(row.partners?.nodes, ({ name }) => ({ text: name }))
              })
            }
          },
          {
            key: 'edit',
            name: '',
            width: 72,
            content ({ row }) {
              return z($icon, {
                icon: editIconPath,
                onclick: () => editingOrgUserStream.next(row)
              })
            }
          }
        ]
      }),
      z('.top.invited-top', [
        z('.left', [
          z('.title', lang.get('orgUsers.invitedUsers'))
        ])
      ]),
      z($table, {
        data: orgUserInvites?.nodes,
        columns: [
          {
            key: 'name',
            name: lang.get('general.name'),
            // width: 200,
            isFlex: true,
            content ({ row }) {
              return row.name
            }
          },
          {
            key: 'email',
            name: lang.get('general.email'),
            width: 250,
            content ({ row }) {
              return row.email
            }
          },
          {
            key: 'roles',
            name: lang.get('general.roles'),
            width: 300,
            content ({ row }) {
              return z($tags, {
                maxVisibleCount: 3,
                tags: _.map(row.roles.nodes, ({ name }) => ({ text: name }))
              })
            }
          },
          {
            key: 'partner',
            name: lang.get('general.partner'),
            width: 300,
            content ({ row }) {
              return z($tags, {
                maxVisibleCount: 3,
                tags: _.map(row.partners?.nodes, ({ name }) => ({ text: name }))
              })
            }
          },
          {
            key: 'edit',
            name: '',
            width: 100,
            content ({ row }) {
              return z('.z-org-users_icons', [
                z($icon, {
                  icon: editIconPath,
                  onclick: () => {
                    editingOrgUserInviteStream.next(row)
                    isInviteOrgUserDialogVisibleStream.next(true)
                  }
                }),
                z($icon, {
                  icon: deleteIconPath,
                  onclick: () => {
                    if (confirm(lang.get('orgUsers.deleteInvite'))) {
                      model.orgUserInvite.deleteById(row.id)
                    }
                  }
                })
              ])
            }
          }
        ]
      })
    ]),
    z($conditionalVisible, {
      isVisibleStream: isInviteOrgUserDialogVisibleStream,
      $component: z($inviteOrgUserDialog, {
        orgUserStream: editingOrgUserStream,
        onClose: () => isInviteOrgUserDialogVisibleStream.next(false)
      })
    }),
    z($conditionalVisible, {
      isVisibleStream: editingOrgUserStream,
      $component: z($editOrgUserDialog, {
        orgUserStream: editingOrgUserStream,
        onClose: () => editingOrgUserStream.next(false)
      })
    })
  )
}
