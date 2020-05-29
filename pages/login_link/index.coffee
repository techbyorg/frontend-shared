import {z, useContext, useEffect, useStream} from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $spinner from '../../components/spinner'
import context from '../../context'
import config from '../../config'

if window?
  require './index.styl'

export default $loginLinkPage = ({requestsStream, serverData}) ->
  {model, router, browser} = useContext context

  useEffect ->
    if window?
      disposable = requestsStream.pipe(
        rx.switchMap ({req, route}) ->
          model.loginLink.getByUserIdAndToken(
            route.params.userId
            route.params.tokenStr
          )
          .pipe rx.switchMap ({data}) ->
            path = data?.loginLink?.data?.path or {key: 'home'}
            # this can fail. if link is expired, won't login
            Rx.fromPromise model.auth.loginLink({
              userId: route.params.userId
              tokenStr: route.params.tokenStr
            }).then ->
              # can't really invalidate since bots/crawlers may hit this url
              # model.loginLink.invalidateById route.params.id
              path = data?.loginLink?.data?.path or 'home'
              if window?
                router?.go path.key, null, {qs: path.qs}
              path
            .catchError ->
              if window?
                router?.go path.key, {qs: path.qs}
              path

        rx.take(1)
      ).subscribe()

    ->
      disposable?.unsubscribe()
  , []

  z '.p-login-link',
    z $spinner
    z '.loading', 'Loading...'
    router.link z 'a.stuck', {
      href: router.get 'home'
    }, 'Stuck? Tap to go home'
