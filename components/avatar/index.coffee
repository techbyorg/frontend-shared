import {z, classKebab} from 'zorium'

if window?
  require './index.styl'

import config from '../../config'
import colors from '../../colors'

DEFAULT_SIZE = '40px'
PLACEHOLDER_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CgogPGc+CiAgPHRpdGxlPmJhY2tncm91bmQ8L3RpdGxlPgogIDxyZWN0IGZpbGw9Im5vbmUiIGlkPSJjYW52YXNfYmFja2dyb3VuZCIgaGVpZ2h0PSI0MDIiIHdpZHRoPSI1ODIiIHk9Ii0xIiB4PSItMSIvPgogPC9nPgogPGc+CiAgPHRpdGxlPkxheWVyIDE8L3RpdGxlPgogIDxwYXRoIGlkPSJzdmdfMSIgZD0ibTE2LDhhNCw0IDAgMCAxIDQsNGE0LDQgMCAwIDEgLTQsNGE0LDQgMCAwIDEgLTQsLTRhNCw0IDAgMCAxIDQsLTRtMCwxMGM0LjQyLDAgOCwxLjc5IDgsNGwwLDJsLTE2LDBsMCwtMmMwLC0yLjIxIDMuNTgsLTQgOCwtNHoiIGZpbGw9InJnYmEoMCwgMCwgMCwgMC41KSIvPgogPC9nPgo8L3N2Zz4='

module.exports = $avatar = ({size = DEFAULT_SIZE, user, src, rotation}) ->

  if prefix = user?.avatarImage?.prefix
    src or= "#{config.USER_CDN_URL}/#{prefix}.small.jpg"

  src or= PLACEHOLDER_URL

  playerColors = config.PLAYER_COLORS
  lastChar = user?.id?.substr(user?.id?.length - 1, 1) or 'a'
  avatarColor = playerColors[ \
    Math.ceil (parseInt(lastChar, 16) / 16) * (playerColors.length - 1)
  ]

  z '.z-avatar', {
    style:
      width: size
      height: size
      backgroundColor: avatarColor
  },
    if src
      z '.image',
        className: if rotation then classKebab {"#{rotation}": true}
        style:
          backgroundImage: if user then "url(#{src})"
