import { z, useStream } from 'zorium'
import * as _ from 'lodash-es'

import $sidebarMenu from '../sidebar_menu'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $settings (props) {
  const { title, subtitle, currentTabStream, tabs, tabProps } = props
  const { currentTab } = useStream(() => ({
    currentTab: currentTabStream
  }))

  const $tab = tabs[currentTab]?.$el || _.values(tabs)[0]?.$el

  const menuItems = _.map(tabs, ({ title, path }, key) => ({
    menuItem: key,
    text: title,
    path
  }))

  return z('.z-source-settings', [
    z('.sidebar', [
      z($sidebarMenu, {
        title,
        subtitle,
        currentMenuItemStream: currentTabStream,
        menuItems
      })
    ]),
    z($tab, tabProps)
  ])
}
