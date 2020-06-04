import {z, classKebab, useMemo, useStream} from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'

if window?
  require './index.styl'

export default $tapTabs = ({selectedIndexStream, tabs, tabProps}) ->
  {selectedIndexStream} = useMemo ->
    {
      selectedIndexStream: selectedIndexStream or new Rx.BehaviorSubject 0
    }
  , []

  {selectedIndex} = useStream ->
    selectedIndex: selectedIndexStream

  z '.z-tap-tabs',
    z '.menu',
      z '.container',
        _.map tabs, ({name}, i) ->
          isSelected = selectedIndex is i
          z '.tap-tab', {
            className: classKebab {isSelected}
            onclick: -> selectedIndexStream.next i
          },
            name

    z '.current-tab',
      z '.container',
        z tabs[selectedIndex].$el, tabProps
