import {useEffect} from 'zorium'
import * as _ from 'lodash-es'

module.exports = useOnClickOutside = ($$refs, handler) ->
  unless _.isArray $$refs
    $$refs = [$$refs]

  useEffect ->
    listener = (e) ->
      unless _.some $$refs, ($$ref) -> $$ref.current?.contains e.target
        handler e

    document.addEventListener 'mousedown', listener
    document.addEventListener 'touchstart', listener

    return ->
      document.removeEventListener 'mousedown', listener
      document.removeEventListener 'touchstart', listener

  , [$$refs] # could add handler here, but would need to useCallback on all passed
