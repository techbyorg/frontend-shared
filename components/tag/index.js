import { z } from 'zorium'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $tag ({ tag }) {
  return z('.z-tag', {
    title: tag.title,
    style: {
      background: tag.background,
      color: tag.color
    }
  }, tag.text)
}
