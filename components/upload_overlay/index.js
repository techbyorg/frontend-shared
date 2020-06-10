import {z} from 'zorium'
import * as _ from 'lodash-es'

if window?
  require './index.styl'

export default $uploadOverlay = ({isMulti, onSelect}) ->
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
      multiple: Boolean isMulti
      onchange: (e) ->
        e?.preventDefault()
        $$imageInput = document.getElementById('image')
        files = $$imageInput?.files

        unless _.isEmpty files
          Promise.all _.map(files, readFile)
          .then (dataUrls) ->
            if isMulti
              onSelect {files, dataUrls}
            else
              onSelect {file: files[0], dataUrl: dataUrls[0]}
