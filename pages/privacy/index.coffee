import {z, useContext} from 'zorium'

import $appBar from '../../components/app_bar'
import $buttonBack from '../../components/button_back'
import $privacy from '../../components/privacy'
import colors from '../../colors'
import context from '../../context'

if window?
  require './index.styl'

export default $privacyPage = ->
  {lang} = useContext context

  z '.p-privacy',
    z $appBar, {
      title: lang.get 'privacyPage.title'
      $topLeftButton: z $buttonBack, {
        color: colors.$header500Icon
      }
    }
    z $privacy
