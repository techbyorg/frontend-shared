import { z } from 'zorium'

import { getArgTypes } from '../../services/story'
import $icon from './index'
import { deleteIconPath } from './paths'

export default {
  title: '$icon',
  component: $icon,
  argTypes: getArgTypes($icon)
}

const Template = (props) => {
  console.log('prop', props)
  return z($icon, props)
}

export const Default = Template.bind({})
Default.args = {
  icon: deleteIconPath
}
