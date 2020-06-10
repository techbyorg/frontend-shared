/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z } from 'zorium'

import $appBar from '../../components/app_bar'
import $signIn from '../../components/sign_in'
let $signInPage

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default $signInPage = () => z('.p-sign-in',
  z($appBar, {
    hasLogo: true
    // $topLeftButton: z $buttonBack, {color: colors.$header500Icon}
  }),
  z($signIn))
