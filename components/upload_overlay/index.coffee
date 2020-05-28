import {z} from 'zorium'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'

if window?
  require './index.styl'

module.exports = $uploadOverlay = ({isMulti, onSelect}) ->
  readFile = (file) ->
    new Promise (resolve, reject) ->
      reader = new FileReader()
      reader.onload = (e) ->
        resolve e.target.result
      reader.onerror = reject
      reader.readAsDataURL file

  z '.z-upload-overlay',
    z 'input#image.overlay',
      type: 'file'
      # this doesn't work in native app. causes file picker to not show at all
      # accept: '.jpg, .jpeg, .png'

      # doesn't work on android currently. https://github.com/apache/cordova-android/issues/621
      multiple: if isMulti then true else undefined
      onchange: (e) ->
        e?.preventDefault()
        $$imageInput = document.getElementById('image')
        files = $$imageInput?.files

        unless _isEmpty files
          Promise.all _map(files, readFile)
          .then (dataUrls) ->
            if isMulti
              onSelect {files, dataUrls}
            else
              onSelect {file: files[0], dataUrl: dataUrls[0]}
