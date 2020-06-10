/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { useEffect } from 'zorium'
import * as _ from 'lodash-es'
let useOnClickOutside

export default useOnClickOutside = function ($$refs, handler) {
  if (!_.isArray($$refs)) {
    $$refs = [$$refs]
  }

  return useEffect(function () {
    function listener (e) {
      const isInTarget = _.some($$refs, $$ref => $$ref.current?.contains(e.target))
      if (!isInTarget) {
        return handler(e)
      }
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return function () {
      document.removeEventListener('mousedown', listener)
      return document.removeEventListener('touchstart', listener)
    }
  }

  , [$$refs]) // could add handler here, but would need to useCallback on all passed
}
