/* eslint-disable
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, useContext } from 'zorium'

import $appBar from '../../components/app_bar'
import $buttonBack from '../../components/button_back'
import $privacy from '../../components/privacy'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $tosPage () {
  const { lang, colors } = useContext(context)

  return z('.p-tos',
    z($appBar, {
      title: lang.get('tosPage.title'),
      $topLeftButton: z($buttonBack, {
        color: colors.$header500Icon
      })
    }),
    z($tos))
}
