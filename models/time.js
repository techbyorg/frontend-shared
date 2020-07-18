export default class Time {
  constructor ({ auth }) {
    this.auth = auth
    this.serverTime = Date.now()
    this.timeInterval = setInterval(() => {
      this.serverTime += 1000
    }, 1000)

    setTimeout(() => {
      return this.updateServerTime()
    }
    , 100)
  }

  updateServerTime = () => {
    this.auth.call({ query: 'query Time { time }' })
      .then(({ data }) => {
        this.serverTime = Date.parse(data.time.now)
      })
  }

  getServerTime = () => {
    return this.serverTime
  }

  dispose = () => {
    clearInterval(this.timeInterval)
  }
}
