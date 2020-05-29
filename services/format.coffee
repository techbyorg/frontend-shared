import z from 'zorium'
import * as _ from 'lodash-es'

import config from '../config'

class FormatService
  number: (number) ->
    # http://stackoverflow.com/a/2901298
    if number?
      Math.round(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    else
      '...'
  # https://stackoverflow.com/a/32638472
  abbreviateNumber: (value, fixed) ->
    unless value?
      return '...'
    # terminate early
    if value is 0
      return '0'
    # terminate early
    fixed = if not fixed or fixed < 0 then 0 else fixed
    # valueber of decimal places to show
    b = value.toPrecision(2).split('e')
    k = if b.length == 1 then 0 else Math.floor(Math.min(b[1].slice(1), 14) / 3)
    c = if k < 1 then value.toFixed(0 + fixed) else (value / 10 ** (k * 3)).toFixed(1 + fixed)
    d = if c < 0 then c else Math.abs(c)
    e = d + [
      ''
      'K'
      'M'
      'B'
      'T'
    ][k]
    # append power
    e

  abbreviateDollar: (value, fixed) =>
    "$ #{@abbreviateNumber value, fixed}"

  location: (obj) ->
    {city, state} = obj or {}
    if city and state
      "#{city}, #{state}"
    else if state
      state
    else if obj
      'Unknown'
    else
      '...'

  percentage: (value) ->
    "#{Math.round(value * 100)}%"

  centsToDollars: (cents) ->
    (cents / 100).toFixed(2)

  countdown: (s) ->
    seconds = Math.floor(s % 60)
    if seconds < 10
      seconds = "0#{seconds}"
    days = Math.floor(s / 86400)
    minutes = Math.floor(s / 60) % 60
    if minutes < 10
      minutes = "0#{minutes}"
    if days > 2
      hours = Math.floor(s / 3600) % 24
      if hours < 10
        hours = "0#{hours}"
      prettyTimer = "#{days} days"
    else
      hours = Math.floor(s / 3600)
      if hours < 10
        hours = "0#{hours}"
      prettyTimer = "#{hours}:#{minutes}:#{seconds}"

    return prettyTimer

  arrayToSentence: (arr) ->
    arr.join(', ').replace(/, ((?:.(?!, ))+)$/, ' and $1')

  # [2015, 2016, 2017, 2019] -> "2015-2017, 2019"
  yearsArrayToEnglish: (years) ->
    lastYear = 0
    isConsecutive = false
    str = ''
    years.forEach (year, i) ->
      if years[i + 1] is year + 1 and not isConsecutive
        str += "#{year}-"
        isConsecutive = true
      else if not isConsecutive
        str += "#{year}, "
      else if years[i + 1] isnt year + 1
        str += "#{year}, "
        isConsecutive = false

    str.slice 0, -2

export default new FormatService()
