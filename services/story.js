import * as _ from 'lodash-es'
import checkPropTypes from 'check-prop-types'

// TODO: rm once preact gets prop table support
// https://github.com/storybookjs/storybook/tree/next/addons/docs#framework-support
export const getArgTypes = ($component) => {
  return _.mapValues($component.propTypes, (propType, propName) => {
    const fakeProps = { [propName]: 'this is a string' }
    const err = checkPropTypes({ [propName]: propType }, fakeProps, 'prop')
    let type = 'string'
    if (err) {
      const expectedTypeRegex = /expected `(\w+)`/i
      try {
        type = err.toString().match(expectedTypeRegex)[1]
      } catch {}
    }
    const isRequired = false // FIXME (test w/ null prop)
    return { type, isRequired }
  })
}
