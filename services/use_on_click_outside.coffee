{useEffect} = require 'zorium'
_isArray = require 'lodash/isArray'
_some = require 'lodash/some'

module.exports = useOnClickOutside = ($$refs, handler) ->
  unless _isArray $$refs
    $$refs = [$$refs]

  useEffect ->
    listener = (e) ->
      unless _some $$refs, ($$ref) -> $$ref.current?.contains e.target
        handler e

    document.addEventListener 'mousedown', listener
    document.addEventListener 'touchstart', listener

    return ->
      document.removeEventListener 'mousedown', listener
      document.removeEventListener 'touchstart', listener

  , [$$refs] # could add handler here, but would need to useCallback on all passed
