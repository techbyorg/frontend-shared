/* eslint-disable
    no-cond-assign,
    no-undef,
    no-unused-vars,
    no-use-before-define,
    no-useless-escape,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, classKebab, useContext, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
// remark = require 'remark'
import unified from 'unified'
import markdown from 'remark-parse'
// FIXME: need dyo equivalent of:
// https://github.com/remarkjs/remark-react/blob/master/index.js
// https://github.com/remarkjs/remark-vdom/blob/master/index.js
import vdom from 'remark-vdom'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $button from '../button'
// $imageViewOverlay = require '../image_view_overlay'
// $embeddedVideo = require '../embedded_video'
import $profileDialog from '../profile_dialog'
import context from '../../context'
import sharedConfig from '../shared_config'
let $formattedText
const supportsWebP = (typeof window !== 'undefined' && window !== null) && require('supports-webp')

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default $formattedText = function (props) {
  let $el, $elStreamy, isExpanded, text
  const {
    textStreamy, imageWidth, model, router, skipImages, mentionedUsers,
    isFullWidth, embedVideos, truncate,
    useThumbnails
  } = options

  const { lang, config } = useContext(context)

  // FIXME: usememo

  if (textStreamy?.pipe) {
    $elStreamy = textStreamy.pipe(rx.map(text => get$({ text, model })))
  } else {
    text = textStreamy
    $elStreamy = get$({ text, model }) // use right away
    $elStreamy = null
  }

  const { isExpandedStream } = useMemo(() => ({
    isExpandedStream: new Rx.BehaviorSubject(false)
  })
  , [])

  return ({ text, isExpanded, $el } = useStream(() => ({
    $elStreamy: $el,
    text,
    isExpanded: isExpandedStream
  })))
}

function get$ ({ text, model, state }) {
  const mentions = text?.match(sharedConfig.MENTION_REGEX)
  text = _.reduce(mentions, function (newText, find) {
    const username = find.replace('', '').toLowerCase()
    return newText.replace(
      find,
      `[${find}](/user/${username} \"user:${username}\")`
    )
  }
  , text)

  unified()
    .use(markdown)
    .use(vdom, {
    // zorium components' states aren't subscribed in here
      components: {
        img (tagName, props, children) {
          let imageAspectRatio, largeImageSrc, matches
          if (!props.src) {
            return
          }

          var imageWidth = imageWidth === 'auto'
            ? undefined
            : 200

          const imageAspectRatioRegex = /%20=([0-9.]+)/ig
          const localImageRegex = new RegExp(`\
${config.USER_CDN_URL.replace('/', '\/')}/cm/(.*?)\\.\
`, 'ig')
          let imageSrc = props.src

          if (matches = imageAspectRatioRegex.exec(imageSrc)) {
            imageAspectRatio = matches[1]
            imageSrc = imageSrc.replace(matches[0], '')
          } else {
            imageAspectRatio = null
          }

          if (matches = localImageRegex.exec(imageSrc)) {
            imageSrc = `${config.USER_CDN_URL}/cm/${matches[1]}.small.jpg`
            largeImageSrc = `${config.USER_CDN_URL}/cm/${matches[1]}.large.jpg`
          }

          if (supportsWebP && (imageSrc.indexOf('giphy.com') !== -1)) {
            imageSrc = imageSrc.replace(/\.gif$/, '.webp')
          }

          if (largeImageSrc == null) { largeImageSrc = imageSrc }

          // else if useThumbnails
          //   z '.image-wrapper',
          //     z 'img', {
          //       src: imageSrc
          //       width: imageWidth
          //       height: if imageAspectRatio and imageWidth isnt 'auto' \
          //               then imageWidth / imageAspectRatio \
          //               else undefined
          //       onclick: (e) ->
          //         # get rid of keyboard on ios
          //         # document.activeElement.blur()
          //         e?.stopPropagation()
          //         e?.preventDefault()
          //         model.overlay.open new ImageViewOverlay {
          //           model
          //           router
          //           imageData:
          //             url: largeImageSrc
          //             aspectRatio: imageAspectRatio
          //         }
          //     }
          return z('img', {
            src: largeImageSrc
          })
        },

        a (tagName, props, children) {
          let mentionedUser, username
          const isMention = props.title && (props.title.indexOf('user:') !== -1)
          if (isMention) {
            username = props.title.replace('user:', '')
            mentionedUser = _.find(mentionedUsers, { username })
          }
          const youtubeId = props.href?.match(sharedConfig.YOUTUBE_ID_REGEX)?.[1]
          const imgurId = props.href?.match(sharedConfig.IMGUR_ID_REGEX)?.[1]

          // if youtubeId and embedVideos
          //   $embeddedVideo = new EmbeddedVideo {
          //     model
          //     video:
          //       sourceId: youtubeId
          //   }
          //   z $embeddedVideo
          // else if imgurId and embedVideos and props.href?.match /\.(gif|mp4|webm)/i
          //   $embeddedVideo = new EmbeddedVideo {
          //     model
          //     video:
          //       src: "https://i.imgur.com/#{imgurId}.mp4"
          //       previewSrc: "https://i.imgur.com/#{imgurId}h.jpg"
          //       mp4Src: "https://i.imgur.com/#{imgurId}.mp4"
          //       webmSrc: "https://i.imgur.com/#{imgurId}.webm"
          //   }
          //   z $embeddedVideo
          // no user found, don't make link
          if (isMention && !mentionedUser) {
            return z('span', children)
          } else {
            return z('a.link', {
              href: props.href,
              className: classKebab({ isMention }),
              onclick (e) {
              e?.stopPropagation()
              e?.preventDefault()
              if (isMention) {
                if (mentionedUser) {
                  return model.overlay.open(z($profileDialog, {
                    model, router, user: mentionedUser
                  }))
                }
              } else {
                return router.openLink(props.href)
              }
              }
            },
            // w/o using raw username for mentions, user_test_
            // will show up in italics
            isMention ? `${username}` : children)
          }
        }
      }
    })
    .processSync(text)
    .contents

  const isTruncated = truncate && (text?.length > truncate.maxLength) &&
                  !isExpanded

  const props =
    { className: classKebab({ isFullWidth, isTruncated }) }

  if (minHeight) {
    props.style = { minHeight }
  }

  if (isTruncated) {
    props.onclick = () => isExpandedStream.next(true)
  }

  return z('.z-formatted-text', props,
    $el || $el,
    truncate
      ? z('.read-more',
        z($button, {
          text: lang.get('general.readMore'),
          isFullWidth: true
        }
        )
      ) : undefined
  )
}
