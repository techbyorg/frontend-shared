let $tag;
import {z} from 'zorium';

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl');
}

export default $tag = ({tag}) => z('.z-tag', {
  style: {
    background: tag.background,
    color: tag.color
  }
},
  tag.text);
