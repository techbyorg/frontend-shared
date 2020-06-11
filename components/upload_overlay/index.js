/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z } from 'zorium'
import * as _ from 'lodash-es'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $uploadOverlay ({ isMulti, onSelect }) {
  const readFile = file => new Promise(function (resolve, reject) {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject
    return reader.readAsDataURL(file)
  })

  return z('.z-upload-overlay',
    z('input#image.overlay', {
      type: 'file',
      // this doesn't work in native app. causes file picker to not show at all
      // accept: '.jpg, .jpeg, .png'

      // doesn't work on android currently. https://github.com/apache/cordova-android/issues/621
      multiple: Boolean(isMulti),
      onchange (e) {
        e?.preventDefault()
        const $$imageInput = document.getElementById('image')
        const files = $$imageInput?.files

        if (!_.isEmpty(files)) {
          return Promise.all(_.map(files, readFile))
            .then(function (dataUrls) {
              if (isMulti) {
                return onSelect({ files, dataUrls })
              } else {
                return onSelect({ file: files[0], dataUrl: dataUrls[0] })
              }
            })
        }
      }
    }))
}
