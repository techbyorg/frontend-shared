import { useMemo } from 'zorium'
import useMetaTag from 'react-metatags-hook'

export default (function (metaCallback, dependencies) {
  const meta = useMemo(metaCallback, (dependencies || []))
  if (meta) {
    return useMetaTag(meta, dependencies)
  }
})
