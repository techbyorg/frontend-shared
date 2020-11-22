import { z } from 'zorium'

import { getArgTypes } from '../../services/story'
import $button from './index'

export default {
  title: '$button',
  component: $button,
  argTypes: getArgTypes($button)
}

const Template = (props) => {
  return z($button, props)
}

export const Primary = Template.bind({})
Primary.args = {
  isPrimary: true,
  text: 'Button'
}
