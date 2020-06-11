/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, useContext, useEffect, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $spinner from '../../components/spinner'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $loginLinkPage ({ requestsStream, serverData }) {
  const { model, router, browser } = useContext(context)

  useEffect(function () {
    let disposable
    if (typeof window !== 'undefined' && window !== null) {
      disposable = requestsStream.pipe(
        rx.switchMap(({ req, route }) => model.loginLink.getByUserIdAndToken(
          route.params.userId,
          route.params.tokenStr
        )
          .pipe(rx.switchMap(function ({ data }) {
            let path = data?.loginLink?.data?.path || { key: 'home' }
            // this can fail. if link is expired, won't login
            return Rx.from(model.auth.loginLink({
              userId: route.params.userId,
              tokenStr: route.params.tokenStr
            }).then(function () {
            // can't really invalidate since bots/crawlers may hit this url
            // model.loginLink.invalidateById route.params.id
              path = data?.loginLink?.data?.path || 'home'
              if (typeof window !== 'undefined' && window !== null) {
              router?.go(path.key, null, { qs: path.qs })
              }
              return path
            })).catchError(function () {
              if (typeof window !== 'undefined' && window !== null) {
              router?.go(path.key, { qs: path.qs })
              }
              return path
            })
          })
          )),

        rx.take(1)
      ).subscribe()
    }

    return () => disposable?.unsubscribe()
  }
  , [])

  return z('.p-login-link',
    z($spinner),
    z('.loading', 'Loading...'),
    router.link(z('a.stuck', {
      href: router.get('home')
    }, 'Stuck? Tap to go home')
    )
  )
}
