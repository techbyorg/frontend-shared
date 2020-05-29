import {z, useContext, useMemo, useStream} from 'zorium'
Rx.BehaviorSubject = require('rxjs/BehaviorSubject').BehaviorSubject

import $button from '../button'
import $dialog from '../dialog'
import context from '../../context'

if window?
  require './index.styl'

export default $requestRatingDialog = ({onClose}) ->
  {model, portal, lang, config, colors} = useContext context

  {isLoadingStream} = useMemo ->
    {
      isLoadingStream: new Rx.BehaviorSubject false
    }
  ,[]

  {isLoading} = useStream ->
    isLoading: isLoadingStream

  z '.z-request-rating-dialog',
      z $dialog,
        onClose: ->
          localStorage.hasSeenRequestRating = '1'
          onClose?()
        isWide: true
        $title: lang.get 'requestRating.title'
        $content: lang.get 'requestRating.text'
        $actions: [
          z $button,
            text: lang.get 'general.no'
            colors:
              cText: colors.$bgText54
            onclick: ->
              localStorage.hasSeenRequestRating = '1'
              onClose?()
          z $button,
            text: lang.get 'requestRating.rate'
            colors:
              cText: colors.$secondaryMain
            onclick: ->
              ga? 'send', 'event', 'requestRating', 'rate'
              localStorage.hasSeenRequestRating = '1'
              isLoadingStream.next true
              portal.call 'app.rate'
              .then ->
                isLoadingStream.next false
                model.overlay.close()
              .catch ->
                isLoadingStream.next false
        ]
