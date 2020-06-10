import {z, classKebab, useContext, useMemo, useStream} from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import context from '../../context'

if window?
  require './index.styl'

export default $togle = (props) ->
  {isSelectedStreams, isSelectedStreams, onToggle, withText} = props
  {lang} = useContext context

  {isSelectedStreams} = useMemo ->
    unless isSelectedStreams
      isSelectedStreams = new Rx.ReplaySubject 1
      isSelectedStreams ?= Rx.of ''
      isSelectedStreams.next isSelectedStream
    {
      isSelectedStreams
    }
  , []

  {isSelected} = useStream ->
    isSelected: isSelectedStreams.pipe rx.switchAll()

  toggle = ({onToggle} = {}) ->
    if isSelected
      isSelected.next not isSelected
    else
      isSelectedStreams.next Rx.of not isSelected
    onToggle? not isSelected


  z '.z-toggle', {
    className: classKebab {isSelected, withText}
    onclick: -> toggle {onToggle}
  },
    z '.track',
      if withText and isSelected
        lang.get 'general.yes'
      else if withText
        lang.get 'general.no'

    z '.knob'
