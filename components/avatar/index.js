import { z, classKebab, useContext } from 'zorium'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

const DEFAULT_SIZE = '40px'
const PLACEHOLDER_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CgogPGc+CiAgPHRpdGxlPmJhY2tncm91bmQ8L3RpdGxlPgogIDxyZWN0IGZpbGw9Im5vbmUiIGlkPSJjYW52YXNfYmFja2dyb3VuZCIgaGVpZ2h0PSI0MDIiIHdpZHRoPSI1ODIiIHk9Ii0xIiB4PSItMSIvPgogPC9nPgogPGc+CiAgPHRpdGxlPkxheWVyIDE8L3RpdGxlPgogIDxwYXRoIGlkPSJzdmdfMSIgZD0ibTE2LDhhNCw0IDAgMCAxIDQsNGE0LDQgMCAwIDEgLTQsNGE0LDQgMCAwIDEgLTQsLTRhNCw0IDAgMCAxIDQsLTRtMCwxMGM0LjQyLDAgOCwxLjc5IDgsNGwwLDJsLTE2LDBsMCwtMmMwLC0yLjIxIDMuNTgsLTQgOCwtNHoiIGZpbGw9InJnYmEoMCwgMCwgMCwgMC41KSIvPgogPC9nPgo8L3N2Zz4='

export default function $avatar ({ user, src, rotation, size = DEFAULT_SIZE }) {
  const { config } = useContext(context)

  const prefix = user?.avatarImage?.prefix
  if (prefix) {
    if (!src) { src = `${config.USER_CDN_URL}/${prefix}.small.jpg` }
  }

  if (!src) { src = PLACEHOLDER_URL }

  const defaultColors = [] // FIXME
  const lastChar = user?.id?.substr(user?.id?.length - 1, 1) || 'a'
  const avatarColor = defaultColors[
    Math.ceil((parseInt(lastChar, 16) / 16) * (defaultColors.length - 1))
  ]

  return z('.z-avatar', {
    style: {
      width: size,
      height: size,
      backgroundColor: avatarColor
    }
  }, [
    src &&
      z('.image', {
        className: rotation ? classKebab({ [rotation]: true }) : undefined,
        style: {
          backgroundImage: user ? `url(${src})` : undefined
        }
      })
  ])
}
