import {z} from 'zorium'

import $appBar from '../../components/app_bar'
import $signIn from '../../components/sign_in'

if window?
  require './index.styl'

export default $signInPage = ->
  z '.p-sign-in',
    z $appBar, {
      hasLogo: true
      # $topLeftButton: z $buttonBack, {color: colors.$header500Icon}
    }
    z $signIn
