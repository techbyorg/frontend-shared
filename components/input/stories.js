import { z } from 'zorium'
import $input from './index'

export default {
  title: '$input',
  component: $input,
  argTypes: {
    // icon
    placeholder: { control: 'text' }
    // valueStream
    // valueStreams
    // errorStream
    // isFullWidth
    // disabled
    // readonly
    // onclick
    // type
    // backgroundColor: { control: 'color' },
    // onClick: { action: 'onClick' }
  }
}

const Template = (props) => {
  console.log('prop', props)
  return z($input, props)
}

export const Default = Template.bind({})
