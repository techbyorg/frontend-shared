/* eslint-disable
    no-return-assign,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
export default class Time {
  constructor ({ auth }) {
    this.updateServerTime = this.updateServerTime.bind(this)
    this.getServerTime = this.getServerTime.bind(this)
    this.dispose = this.dispose.bind(this)
    this.auth = auth
    this.serverTime = Date.now()
    this.timeInterval = setInterval(() => {
      return this.serverTime += 1000
    }
    , 1000)

    setTimeout(() => {
      return this.updateServerTime()
    }
    , 100)
  }

  updateServerTime () {
    return this.auth.call({ query: 'query Time { time }' })
      .then(({ data }) => {
        return this.serverTime = Date.parse(data.time.now)
      })
  }

  getServerTime () {
    return this.serverTime
  }

  dispose () {
    return clearInterval(this.timeInterval)
  }

  getCurrentSeason () { return 'spring' } // TODO
}
