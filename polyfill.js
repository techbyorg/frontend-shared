# Promise polyfill - https://github.com/zolmeister/promiz
import Promiz from 'promiz'
window.Promise = window.Promise or Promiz

# Fetch polyfill - https://github.com/github/fetch
require 'whatwg-fetch'
