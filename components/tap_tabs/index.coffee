{z, classKebab, useMemo, useStream} = require 'zorium'
RxBehaviorSubject = require('rxjs/BehaviorSubject').BehaviorSubject
_map = require 'lodash/map'

if window?
  require './index.styl'

module.exports = $tapTabs = ({selectedIndexStream, tabs, tabProps}) ->
  {selectedIndexStream} = useMemo ->
    {
      selectedIndexStream: selectedIndexStream or new RxBehaviorSubject 0
    }
  , []

  {selectedIndex} = useStream ->
    selectedIndex: selectedIndexStream

  z '.z-tap-tabs',
    z '.menu',
      _map tabs, ({name}, i) ->
        isSelected = selectedIndex is i
        z '.tap-tab', {
          className: classKebab {isSelected}
          onclick: -> selectedIndexStream.next i
        },
          name

    z '.current-tab',
      z tabs[selectedIndex].$el, tabProps
