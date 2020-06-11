/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z } from 'zorium'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $tag ({ tag }) {
  z('.z-tag', {
    style: {
      background: tag.background,
      color: tag.color
    }
  }, tag.text)
}
