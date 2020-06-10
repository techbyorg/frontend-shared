URL_REGEX_STR = '(\\bhttps?://[-A-Z0-9+&@#/%?=~_|!:,.;]*[A-Z0-9+&@#/%=~_|])'
STICKER_REGEX_STR = '(:[a-z_]+:)'
IMAGE_REGEX_STR = '(\\!\\[(.*?)\\]\\((.*?)\\=([0-9.]+)x([0-9.]+)\\))'
IMAGE_REGEX_BASE_STR = '(\\!\\[(?:.*?)\\]\\((?:.*?)\\))'
LOCAL_IMAGE_REGEX_STR =
  '(\\!\\[(.*?)\\]\\(local://(.*?) \\=([0-9.]+)x([0-9.]+)\\))'
MENTION_REGEX_STR = '\\@[a-zA-Z0-9_-]+'
YOUTUBE_ID_REGEX_STR =
  '(?:youtube\\.com\\/(?:[^\\/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([^"&?\\/ ]{11})'

export default
  ENV: process.env.NODE_ENV
  ENVS:
    DEV: 'development'
    PROD: 'production'
    TEST: 'test'
  URL_REGEX_STR: URL_REGEX_STR
  URL_REGEX: new RegExp URL_REGEX_STR, 'gi'
  LOCAL_IMAGE_REGEX_STR: LOCAL_IMAGE_REGEX_STR
  IMAGE_REGEX_BASE_STR: IMAGE_REGEX_BASE_STR
  IMAGE_REGEX_STR: IMAGE_REGEX_STR
  IMAGE_REGEX: new RegExp IMAGE_REGEX_STR, 'gi'
  MENTION_REGEX: new RegExp MENTION_REGEX_STR, 'gi'
  YOUTUBE_ID_REGEX: new RegExp YOUTUBE_ID_REGEX_STR, 'i'
  IMGUR_ID_REGEX: /https?:\/\/(?:i\.)?imgur\.com(?:\/a)?\/(.*?)(?:[\.#\/].*|$)/i
