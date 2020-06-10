/* eslint-disable
    no-unused-vars,
    no-useless-escape,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
const URL_REGEX_STR = '(\\bhttps?://[-A-Z0-9+&@#/%?=~_|!:,.;]*[A-Z0-9+&@#/%=~_|])'
const STICKER_REGEX_STR = '(:[a-z_]+:)'
const IMAGE_REGEX_STR = '(\\!\\[(.*?)\\]\\((.*?)\\=([0-9.]+)x([0-9.]+)\\))'
const IMAGE_REGEX_BASE_STR = '(\\!\\[(?:.*?)\\]\\((?:.*?)\\))'
const LOCAL_IMAGE_REGEX_STR =
  '(\\!\\[(.*?)\\]\\(local://(.*?) \\=([0-9.]+)x([0-9.]+)\\))'
const MENTION_REGEX_STR = '\\@[a-zA-Z0-9_-]+'
const YOUTUBE_ID_REGEX_STR =
  '(?:youtube\\.com\\/(?:[^\\/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([^"&?\\/ ]{11})'

export default
({
  ENV: process.env.NODE_ENV,
  ENVS: {
    DEV: 'development',
    PROD: 'production',
    TEST: 'test'
  },
  URL_REGEX_STR,
  URL_REGEX: new RegExp(URL_REGEX_STR, 'gi'),
  LOCAL_IMAGE_REGEX_STR,
  IMAGE_REGEX_BASE_STR,
  IMAGE_REGEX_STR,
  IMAGE_REGEX: new RegExp(IMAGE_REGEX_STR, 'gi'),
  MENTION_REGEX: new RegExp(MENTION_REGEX_STR, 'gi'),
  YOUTUBE_ID_REGEX: new RegExp(YOUTUBE_ID_REGEX_STR, 'i'),
  IMGUR_ID_REGEX: /https?:\/\/(?:i\.)?imgur\.com(?:\/a)?\/(.*?)(?:[\.#\/].*|$)/i
})
