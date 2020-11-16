import { z, useMemo } from 'zorium'
import * as rx from 'rxjs/operators'

import $appBar from '../../components/app_bar'
import $signIn from '../../components/sign_in'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $signInPage ({ requestsStream }) {
  const { inviteTokenStrStream } = useMemo(() => {
    return {
      inviteTokenStrStream: requestsStream.pipe(
        rx.map(({ route }) => route.params.inviteTokenStr)
      )
    }
  }, [])

  return z('.p-sign-in', [
    z($appBar, {
      hasLogo: true
      // $topLeftButton: z $buttonBack, {color: colors.$header500Icon}
    }), z($signIn, { inviteTokenStrStream })
  ])
}
