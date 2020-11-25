import { z } from 'zorium'

import { getArgTypes } from '../../services/story'
import $appBarUserMenu from './index'

export default {
  title: '$appBarUserMenu',
  component: $appBarUserMenu,
  argTypes: getArgTypes($appBarUserMenu)
}

const Template = (props) => {
  return z($appBarUserMenu, props)
}

export const Default = Template.bind({})
Default.args = {}
