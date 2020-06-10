let $privacyPage;
import {z, useContext} from 'zorium';

import $appBar from '../../components/app_bar';
import $buttonBack from '../../components/button_back';
import $privacy from '../../components/privacy';
import context from '../../context';

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl');
}

export default $privacyPage = function() {
  const {lang, colors} = useContext(context);

  return z('.p-privacy',
    z($appBar, {
      title: lang.get('privacyPage.title'),
      $topLeftButton: z($buttonBack, {
        color: colors.$header500Icon
      })
    }),
    z($privacy));
};
