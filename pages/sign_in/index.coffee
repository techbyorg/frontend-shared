import {z} from 'zorium'
RxBehaviorSubject = require('rxjs/BehaviorSubject').BehaviorSubject

import $appBar from '../../components/app_bar'
import $signIn from '../../components/sign_in'
import config from '../../config'

if window?
  require './index.styl'

module.exports = $signInPage = ->
  z '.p-sign-in',
    z $appBar, {
      hasLogo: true
      # $topLeftButton: z $buttonBack, {color: colors.$header500Icon}
    }
    z $signIn
