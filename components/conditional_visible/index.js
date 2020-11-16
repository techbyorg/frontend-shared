/*
this component exists to:
1) keep a child component (eg dialog/modal) from mounting and running all
   memo, stream, etc... before it's needed
2) prevent parent components from having to rerender entirely to display/hide
   child component
*/
import { useStream } from 'zorium'

export default function $conditionalVisible ({ isVisibleStream, $component }) {
  const { isVisible } = useStream(() => ({
    isVisible: isVisibleStream
  }))

  return [
    isVisible && $component
  ]
}
