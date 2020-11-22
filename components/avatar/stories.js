import { z } from 'zorium'

import { getArgTypes } from '../../services/story'
import $avatar from './index'

export default {
  title: '$avatar',
  component: $avatar,
  argTypes: getArgTypes($avatar)
}

const Template = (props) => {
  return z($avatar, props)
}

export const Default = Template.bind({})
Default.args = {}
