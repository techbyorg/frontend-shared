import { z, useContext } from 'zorium'

import $appBar from '../../components/app_bar'
import $buttonBack from '../../components/button_back'
import $tos from '../../components/tos'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $tosPage () {
  const { lang, colors } = useContext(context)

  return z('.p-tos', [
    z($appBar, {
      title: lang.get('tosPage.title'),
      $topLeftButton: z($buttonBack, {
        color: colors.$header500Icon
      })
    }),
    z($tos)
  ])
}
