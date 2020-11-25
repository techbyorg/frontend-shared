import { z } from 'zorium'

import { getArgTypes } from '../../services/story'
import $bottomBar from './index'

export default {
  title: '$bottomBar',
  component: $bottomBar,
  argTypes: getArgTypes($bottomBar)
}

const Template = (props) => {
  return z($bottomBar, props)
}

export const Default = Template.bind({})
Default.args = {}
