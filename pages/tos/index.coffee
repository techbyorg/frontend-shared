import {z, useContext} from 'zorium'

import $appBar from '../../components/app_bar'
import $buttonBack from '../../components/button_back'
import $privacy from '../../components/privacy'
import context from '../../context'

if window?
  require './index.styl'

export default $tosPage = ->
  {lang, colors} = useContext context

  z '.p-tos',
    z $appBar, {
      title: lang.get 'tosPage.title'
      $topLeftButton: z $buttonBack, {
        color: colors.$header500Icon
      }
    }
    z $tos
