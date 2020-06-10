// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
// Promise polyfill - https://github.com/zolmeister/promiz
import Promiz from 'promiz'
window.Promise = window.Promise || Promiz

// Fetch polyfill - https://github.com/github/fetch
require('whatwg-fetch')
