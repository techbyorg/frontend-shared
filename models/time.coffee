module.exports = class Time
  constructor: ({@auth}) ->
    @serverTime = Date.now()
    @timeInterval = setInterval =>
      @serverTime += 1000
    , 1000

    setTimeout =>
      @updateServerTime()
    , 100

  updateServerTime: =>
    @auth.call
      query: 'query Time { time }'
    .then ({data}) =>
      @serverTime = Date.parse data.time.now

  getServerTime: =>
    @serverTime

  dispose: =>
    clearInterval @timeInterval

  getCurrentSeason: -> 'spring' # TODO
