import { z } from 'zorium'

import { getArgTypes } from '../../services/story'
import $appBar from './index'

export default {
  title: '$appBar',
  component: $appBar,
  argTypes: getArgTypes($appBar)
}

const Template = (props) => {
  return z($appBar, props)
}

export const Default = Template.bind({})
Default.args = {
  title: 'Test page'
}
