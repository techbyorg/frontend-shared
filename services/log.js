const MAX_ERRORS_LOGGED = 5

class Log {
  constructor () {
    this.init = this.init.bind(this)
    this.errorsSent = 0
  }

  init ({ apiUrl }) {
    // Report errors to API_URL/log
    const postErrToServer = (err) => {
      if (this.errorsSent < MAX_ERRORS_LOGGED) {
        this.errorsSent += 1
        window.fetch(`${apiUrl}/log`, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain'
          }, // Avoid CORS preflight
          body: JSON.stringify({
            event: 'client_error',
            trace: null, // trace
            error: JSON.stringify(err)
          })
        }).catch(err => console?.log('logs post', err))
      }
    }

    const oldOnError = window.onerror
    window.onerror = function (message, file, line, column, error) {
      // if we log with `new Error` it's pretty pointless (gives error message that
      // just points to this line). if we pass the 5th argument (error), it breaks
      // on json.stringify
      // log.error error or new Error message
      const err = { message, file, line, column }
      postErrToServer(err)

      if (oldOnError) {
        oldOnError(...arguments)
      }
    }
  }
}

export default new Log()
