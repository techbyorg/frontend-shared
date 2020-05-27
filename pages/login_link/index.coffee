{z, useContext, useEffect, useStream} = require 'zorium'
RxObservable = require('rxjs/Observable').Observable
require 'rxjs/add/observable/fromPromise'

$spinner = require '../../components/spinner'
context = require '../../context'
config = require '../../config'

if window?
  require './index.styl'

module.exports = $loginLinkPage = ({requestsStream, serverData}) ->
  {model, router, browser} = useContext context

  useEffect ->
    if window?
      disposable = requestsStream.switchMap ({req, route}) ->
        model.loginLink.getByUserIdAndToken(
          route.params.userId
          route.params.tokenStr
        )
        .switchMap ({data}) ->
          path = data?.loginLink?.data?.path or {key: 'home'}
          # this can fail. if link is expired, won't login
          RxObservable.fromPromise model.auth.loginLink({
            userId: route.params.userId
            tokenStr: route.params.tokenStr
          }).then ->
            # can't really invalidate since bots/crawlers may hit this url
            # model.loginLink.invalidateById route.params.id
            path = data?.loginLink?.data?.path or 'home'
            if window?
              router?.go path.key, null, {qs: path.qs}
            path
          .catch ->
            if window?
              router?.go path.key, {qs: path.qs}
            path

      .take(1)
      .subscribe()

    ->
      disposable?.unsubscribe()
  , []

  z '.p-login-link',
    z $spinner
    z '.loading', 'Loading...'
    router.link z 'a.stuck', {
      href: router.get 'home'
    }, 'Stuck? Tap to go home'
