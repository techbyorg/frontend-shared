import * as _ from 'lodash-es'
RxBehaviorSubject = require('rxjs/BehaviorSubject').BehaviorSubject

import DateService from '../services/date'
import config from '../config'

class Language
  constructor: ({language, @cookie, @files} = {}) ->
    language ?= 'en'

    @language = new RxBehaviorSubject language

    # also update gulpfile ContextReplacementPlugin for moment
    if window? and config.ENV is config.ENVS.PROD
      # done like this so compile time is quicker
      @files = window.languageStrings

    @setLanguage language

  getLanguageByCountry: (country) ->
    country = country?.toUpperCase()
    if country is 'FR'
      'fr'
    else
      'en'

  setLanguage: (language) =>
    @language.next language
    @cookie?.set 'language', language
    # FIXME: shouldn't have to do this. should date be on context?
    DateService.setLang this
    DateService.setLocale language

  getLanguage: => @language

  getLanguageStr: => @language.getValue()

  getAll: ->
    config.LANGUAGES

  getAllUrlLanguages: ->
    ['en']

  getRouteKeyByValue: (routeValue) =>
    language = @getLanguageStr()
    _.findKey(@files['paths'][language], (route) ->
      route is routeValue) or _.findKey(@files['paths']['en'], (route) ->
        route is routeValue)

  getAllPathsByRouteKey: (routeKey) =>
    languages = @getAllUrlLanguages()
    _.reduce languages, (paths, language) =>
      path = @files['paths'][language]?[routeKey]
      if path
        paths[language] = path
      paths
    , {}

  get: (strKey, {replacements, file, language} = {}) =>
    file ?= 'strings'
    language ?= @getLanguageStr()
    baseResponse = @files[file][language]?[strKey] or
                    @files[file]['en']?[strKey] or ''

    unless baseResponse
      console.log 'missing', file, strKey

    if typeof baseResponse is 'object'
      # some languages (czech) have many plural forms
      pluralityCount = replacements[baseResponse.pluralityCheck]
      baseResponse = baseResponse.plurality[pluralityCount] or
                      baseResponse.plurality.other or ''

    _.reduce replacements, (str, replace, key) ->
      find = ///{#{key}}///g
      str.replace find, replace
    , baseResponse


module.exports = Language
