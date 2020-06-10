import {z, classKebab, useContext, useMemo, useStream} from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import context from '../../context'

if window?
  require './index.styl'

export default $tapTabs = (props) ->
  {selectedIndexStreams, selectedIndexStream, tabs, tabProps} = props
  {router} = useContext context

  {selectedIndexStream} = useMemo ->
    {
      selectedIndexStream: selectedIndexStream or new Rx.BehaviorSubject 0
    }
  , []

  {selectedIndex} = useStream ->
    selectedIndex:
      selectedIndexStreams?.pipe(rx.switchAll()) or selectedIndexStream

  z '.z-tap-tabs',
    z '.menu',
      z '.container',
        _.map tabs, ({name, route}, i) ->
          isSelected = selectedIndex is i

          router.linkIfHref z '.tap-tab', {
            className: classKebab {isSelected}
            href: route
            onclick: ->
              if selectedIndexStreams
                selectedIndexStreams.next Rx.of i
              else
                selectedIndexStream.next i
          },
            name

    z '.current-tab',
      z '.container',
        if selectedIndex?
          z tabs[selectedIndex].$el, tabProps
