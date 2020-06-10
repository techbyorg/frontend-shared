import {useMemo} from 'zorium'
import useMetaTag from 'react-metatags-hook'

export default (metaCallback, dependencies) ->
  meta = useMemo metaCallback, (dependencies or [])
  if meta
    useMetaTag meta, dependencies
