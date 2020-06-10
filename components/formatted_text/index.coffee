import {z, classKebab, useContext, useMemo, useStream} from 'zorium'
import * as _ from 'lodash-es'
supportsWebP = window? and require 'supports-webp'
# remark = require 'remark'
import unified from 'unified'
import markdown from 'remark-parse'
# FIXME: need dyo equivalent of:
# https://github.com/remarkjs/remark-react/blob/master/index.js
# https://github.com/remarkjs/remark-vdom/blob/master/index.js
import vdom from 'remark-vdom'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $button from '../button'
# $imageViewOverlay = require '../image_view_overlay'
# $embeddedVideo = require '../embedded_video'
import $profileDialog from '../profile_dialog'
import context from '../../context'
import sharedConfig from '../shared_config'

if window?
  require './index.styl'

export default $formattedText = (props) ->
  {textStreamy, imageWidth, model, router, skipImages, mentionedUsers,
    isFullWidth, embedVideos, truncate
    useThumbnails} = options

  {lang, config} = useContext context

  # FIXME: usememo

  if textStreamy?.pipe
    $elStreamy = textStreamy.pipe rx.map (text) -> get$ {text, model}
  else
    text = textStreamy
    $elStreamy = get$ {text, model} # use right away
    $elStreamy = null

  {isExpandedStream} = useMemo ->
    {isExpandedStream: new Rx.BehaviorSubject false}
  , []

  {text, isExpanded, $el} = useStream ->
    $elStreamy: $el
    text: text
    isExpanded: isExpandedStream

get$ = ({text, model, state}) ->
  mentions = text?.match sharedConfig.MENTION_REGEX
  text = _.reduce mentions, (newText, find) ->
    username = find.replace('', '').toLowerCase()
    newText.replace(
      find
      "[#{find}](/user/#{username} \"user:#{username}\")"
    )
  , text

  unified()
  .use markdown
  .use vdom, {
    # zorium components' states aren't subscribed in here
    components:
      img: (tagName, props, children) ->
        if not props.src
          return

        imageWidth = if imageWidth is 'auto' \
                     then undefined \
                     else 200

        imageAspectRatioRegex = /%20=([0-9.]+)/ig
        localImageRegex = ///
          #{config.USER_CDN_URL.replace '/', '\/'}/cm/(.*?)\.
        ///ig
        imageSrc = props.src

        if matches = imageAspectRatioRegex.exec imageSrc
          imageAspectRatio = matches[1]
          imageSrc = imageSrc.replace matches[0], ''
        else
          imageAspectRatio = null

        if matches = localImageRegex.exec imageSrc
          imageSrc = "#{config.USER_CDN_URL}/cm/#{matches[1]}.small.jpg"
          largeImageSrc = "#{config.USER_CDN_URL}/cm/#{matches[1]}.large.jpg"

        if supportsWebP and imageSrc.indexOf('giphy.com') isnt -1
          imageSrc = imageSrc.replace /\.gif$/, '.webp'

        largeImageSrc ?= imageSrc

        # else if useThumbnails
        #   z '.image-wrapper',
        #     z 'img', {
        #       src: imageSrc
        #       width: imageWidth
        #       height: if imageAspectRatio and imageWidth isnt 'auto' \
        #               then imageWidth / imageAspectRatio \
        #               else undefined
        #       onclick: (e) ->
        #         # get rid of keyboard on ios
        #         # document.activeElement.blur()
        #         e?.stopPropagation()
        #         e?.preventDefault()
        #         model.overlay.open new ImageViewOverlay {
        #           model
        #           router
        #           imageData:
        #             url: largeImageSrc
        #             aspectRatio: imageAspectRatio
        #         }
        #     }
        z 'img', {
          src: largeImageSrc
        }

      a: (tagName, props, children) ->
        isMention = props.title and props.title.indexOf('user:') isnt -1
        if isMention
          username = props.title.replace 'user:', ''
          mentionedUser = _.find mentionedUsers, {username}
        youtubeId = props.href?.match(sharedConfig.YOUTUBE_ID_REGEX)?[1]
        imgurId = props.href?.match(sharedConfig.IMGUR_ID_REGEX)?[1]

        # if youtubeId and embedVideos
        #   $embeddedVideo = new EmbeddedVideo {
        #     model
        #     video:
        #       sourceId: youtubeId
        #   }
        #   z $embeddedVideo
        # else if imgurId and embedVideos and props.href?.match /\.(gif|mp4|webm)/i
        #   $embeddedVideo = new EmbeddedVideo {
        #     model
        #     video:
        #       src: "https://i.imgur.com/#{imgurId}.mp4"
        #       previewSrc: "https://i.imgur.com/#{imgurId}h.jpg"
        #       mp4Src: "https://i.imgur.com/#{imgurId}.mp4"
        #       webmSrc: "https://i.imgur.com/#{imgurId}.webm"
        #   }
        #   z $embeddedVideo
        # no user found, don't make link
        if isMention and not mentionedUser
          z 'span', children
        else
          z 'a.link', {
            href: props.href
            className: classKebab {isMention}
            onclick: (e) ->
              e?.stopPropagation()
              e?.preventDefault()
              if isMention
                if mentionedUser
                  model.overlay.open z $profileDialog, {
                    model, router, user: mentionedUser
                  }
              else
                router.openLink props.href
          },
            # w/o using raw username for mentions, user_test_
            # will show up in italics
            if isMention then "#{username}" else children
  }
  .processSync text
  .contents

  isTruncated = truncate and text?.length > truncate.maxLength and
                  not isExpanded

  props =
    className: classKebab {isFullWidth, isTruncated}

  if minHeight
    props.style = {minHeight}

  if isTruncated
    props.onclick = -> isExpandedStream.next true

  z '.z-formatted-text', props,
    $el or $el
    if truncate
      z '.read-more',
        z $button,
          text: lang.get 'general.readMore'
          isFullWidth: true
