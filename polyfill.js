import Promiz from 'promiz'
window.Promise = window.Promise || Promiz

// Fetch polyfill - https://github.com/github/fetch
require('whatwg-fetch')
