// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'

import DateService from '../services/date'

class Language {
  constructor (param) {
    this.setLanguage = this.setLanguage.bind(this)
    this.getLanguage = this.getLanguage.bind(this)
    this.getLanguageStr = this.getLanguageStr.bind(this)
    this.getRouteKeyByValue = this.getRouteKeyByValue.bind(this)
    this.getAllPathsByRouteKey = this.getAllPathsByRouteKey.bind(this)
    this.get = this.get.bind(this)
    if (param == null) { param = {} }
    let { language, cookie, files } = param
    this.cookie = cookie
    this.files = files
    if (language == null) { language = 'en' }

    this.language = new Rx.BehaviorSubject(language)

    this.setLanguage(language)
  }

  getLanguageByCountry (country) {
    country = country?.toUpperCase()
    if (country === 'FR') {
      return 'fr'
    } else {
      return 'en'
    }
  }

  setLanguage (language) {
    this.language.next(language)
    this.cookie?.set('language', language)
    // FIXME: shouldn't have to do this. should date be on context?
    DateService.setLang(this)
    return DateService.setLocale(language)
  }

  getLanguage () { return this.language }

  getLanguageStr () { return this.language.getValue() }

  // getAll: ->
  //   config.LANGUAGES

  getAllUrlLanguages () {
    return ['en']
  }

  getRouteKeyByValue (routeValue) {
    const language = this.getLanguageStr()
    return _.findKey(this.files.paths[language], route => route === routeValue) || _.findKey(this.files.paths.en, route => route === routeValue)
  }

  getAllPathsByRouteKey (routeKey) {
    const languages = this.getAllUrlLanguages()
    return _.reduce(languages, (paths, language) => {
      const path = this.files.paths[language]?.[routeKey]
      if (path) {
        paths[language] = path
      }
      return paths
    }
    , {})
  }

  get (strKey, param) {
    if (param == null) { param = {} }
    let { replacements, file, language } = param
    if (file == null) { file = 'strings' }
    if (language == null) { language = this.getLanguageStr() }
    let baseResponse = this.files[file][language]?.[strKey] ||
                    this.files[file].en?.[strKey] || ''

    if (!baseResponse) {
      console.log('missing', file, strKey)
    }

    if (typeof baseResponse === 'object') {
      // some languages (czech) have many plural forms
      const pluralityCount = replacements[baseResponse.pluralityCheck]
      baseResponse = baseResponse.plurality[pluralityCount] ||
                      baseResponse.plurality.other || ''
    }

    return _.reduce(replacements, function (str, replace, key) {
      const find = new RegExp(`{${key}}`, 'g')
      return str.replace(find, replace)
    }
    , baseResponse)
  }
}

export default Language
