/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import semverCompare from 'semver-compare'
import * as _ from 'lodash-es'

const ONE_MINUTE_S = 60
const ONE_HOUR_S = 3600
const ONE_DAY_S = 3600 * 24
const ONE_WEEK_S = 3600 * 24 * 7

class DateService {
  constructor () {
    this.setLang = this.setLang.bind(this)
    this.formatSeconds = this.formatSeconds.bind(this)
    this.fromNowSeconds = this.fromNowSeconds.bind(this)
    this.fromNow = this.fromNow.bind(this)
    this.setLocale('en')
  }

  setLang (lang) { this.lang = lang; return null }

  format (date, format) {
    let D, mm, MMM, yyyy
    if (!(date instanceof Date)) {
      date = new Date(date)
    }
    // TODO: only thing that uses this so far uses yyyy-mm-dd format and MMM Do
    if (format === 'MMM D') {
      MMM = this.lang.get(`months.${date.getMonth()}`).substring(0, 3)
      D = date.getDate()
      return `${MMM} ${D}`
    } else if (format === 'MMM D, h:mm a') {
      MMM = this.lang.get(`months.${date.getMonth()}`).substring(0, 3)
      D = date.getDate()
      const hours = date.getHours()
      let h = hours % 12
      if (h === 0) {
        h = 12
      }
      mm = _.padStart(date.getMinutes(), 2, '0')
      const a = hours > 12 ? 'pm' : 'am'
      return `${MMM} ${D}, ${h}:${mm} ${a}`
    } else if (format === 'MMMM yyyy') {
      const MMMM = this.lang.get(`months.${date.getMonth()}`)
      yyyy = date.getFullYear()
      return `${MMMM} ${yyyy}`
    } else if (format === 'MMM yyyy') {
      MMM = this.lang.get(`months.${date.getMonth()}`).substring(0, 3)
      yyyy = date.getFullYear()
      return `${MMM} ${yyyy}`
    } else {
      yyyy = date.getFullYear()
      mm = date.getMonth() + 1
      if (mm < 10) {
        mm = `0${mm}`
      }
      let dd = date.getDate()
      if (dd < 10) {
        dd = `0${dd}`
      }
      return `${yyyy}-${mm}-${dd}`
    }
  }

  formatDuration (duration) {
    // https://stackoverflow.com/a/30134889
    let match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
    match = match.slice(1).map(x => x?.replace(/\D/, ''))
    const hours = _.padStart(parseInt(match[0]) || 0, 2, '0')
    const minutes = _.padStart(parseInt(match[1]) || 0, 2, '0')
    const seconds = _.padStart(parseInt(match[2]) || 0, 2, '0')
    if (hours !== '00') {
      return `${hours}:${minutes}:${seconds}`
    } else if (minutes !== '00') {
      return `${minutes}:${seconds}`
    } else {
      return `00:${seconds}`
    }
  }

  formatSeconds (seconds, precision) {
    let divisor, str
    if (precision == null) { precision = 0 }
    if (seconds < ONE_MINUTE_S) {
      divisor = 1
      str = this.lang.get('time.secondShorthand')
    } else if (seconds < ONE_HOUR_S) {
      divisor = ONE_MINUTE_S
      str = this.lang.get('time.minuteShorthand')
    } else if (seconds <= ONE_DAY_S) {
      divisor = ONE_HOUR_S
      str = this.lang.get('time.hourShorthand')
    } else if (seconds <= ONE_WEEK_S) {
      divisor = ONE_DAY_S
      str = this.lang.get('time.dayShorthand')
    }
    return +parseFloat(seconds / divisor).toFixed(precision) + str
  }

  fromNowSeconds (seconds) {
    if (isNaN(seconds)) {
      return '...'
    } else if (seconds < 30) {
      return this.lang.get('time.justNow')
    } else if (seconds < ONE_MINUTE_S) {
      return parseInt(seconds) + this.lang.get('time.secondShorthand')
    } else if (seconds < ONE_HOUR_S) {
      return parseInt(seconds / ONE_MINUTE_S) + this.lang.get('time.minuteShorthand')
    } else if (seconds <= ONE_DAY_S) {
      return parseInt(seconds / ONE_HOUR_S) + this.lang.get('time.hourShorthand')
    } else if (seconds <= ONE_WEEK_S) {
      return parseInt(seconds / ONE_DAY_S) + this.lang.get('time.dayShorthand')
    } else {
      return parseInt(seconds / ONE_WEEK_S) + this.lang.get('time.weekShorthand')
    }
  }

  fromNow (date) {
    if (!(date instanceof Date)) {
      date = new Date(date)
    }
    const seconds = Math.abs((Date.now() - date.getTime()) / 1000)
    return this.fromNowSeconds(seconds)
  }

  setLocale (locale) {
    return null
  }
  // @langocaleFile = if globalThis?.window?
  //   globalThis?.window?.dateLocales?[locale]
  // else
  //   require("date-fns/locale/#{locale}")

  getLocalDateFromStr (str) {
    if (str) {
      const arr = str.split('-')
      return new Date(arr[0], arr[1] - 1, arr[2])
    } else {
      return null
    }
  }
}

export default new DateService()
