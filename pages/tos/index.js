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
let $tosPage

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default $tosPage = function () {
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
