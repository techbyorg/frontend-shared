import { z } from 'zorium'

import $appBar from '../../components/app_bar'
import $signIn from '../../components/sign_in'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $signInPage () {
  return z('.p-sign-in', [
    z($appBar, {
      hasLogo: true
      // $topLeftButton: z $buttonBack, {color: colors.$header500Icon}
    }), z($signIn)
  ])
}
