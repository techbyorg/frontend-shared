import { z } from 'zorium'

import { getArgTypes } from '../../services/story'
import $buttonBack from './index'

export default {
  title: '$buttonBack',
  component: $buttonBack,
  argTypes: getArgTypes($buttonBack)
}

const Template = (props) => {
  return z($buttonBack, props)
}

export const Primary = Template.bind({})
Primary.args = {
  isPrimary: true,
  text: 'Button'
}
