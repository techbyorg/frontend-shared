MAX_ERRORS_LOGGED = 5

class Log
  constructor: ->
    @errorsSent = 0
  init: ->
    # Report errors to API_URL/log
    postErrToServer = (err) ->
      if @errorsSent < MAX_ERRORS_LOGGED
        @errorsSent += 1
        window.fetch config.API_URL + '/log',
          method: 'POST'
          headers:
            'Content-Type': 'text/plain' # Avoid CORS preflight
          body: JSON.stringify
            event: 'client_error'
            trace: null # trace
            error: JSON.stringify err
        .catch (err) ->
          console?.log 'logs post', err

    oldOnError = window.onerror
    window.onerror = (message, file, line, column, error) ->
      # if we log with `new Error` it's pretty pointless (gives error message that
      # just points to this line). if we pass the 5th argument (error), it breaks
      # on json.stringify
      # log.error error or new Error message
      err = {message, file, line, column}
      postErrToServer err

      if oldOnError
        return oldOnError arguments...

export default new Log()
