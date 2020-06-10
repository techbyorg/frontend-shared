let $policiesPage;
import {z} from 'zorium';

import $policies from '../../components/policies';

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl');
}

export default $policiesPage = ({requestsStream}) => z('.p-policies',
  z($policies, {
    isIabStream: requestsStream.map(({req}) => req.query.isIab)
  }));
