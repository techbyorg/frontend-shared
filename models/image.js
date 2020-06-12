function hashFn (s) {
  if (!s) {
    return 'none'
  }
  return s.split('').reduce(function (a, b) {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
}

export default class ImageModel {
  constructor () {
    this.load = this.load.bind(this)
    this.isLoaded = this.isLoaded.bind(this)
    this.isLoadedByHash = this.isLoadedByHash.bind(this)
    this.loadedImages = {}
  }
  // TODO: clear this out every once in a while (otherwise it's technically a memory leak)

  load (url) {
    const hash = hashFn(url)
    if (this.loadedImages[hash] === true) {
      return Promise.resolve(null)
    } else if (this.loadedImages[hash]) {
      return this.loadedImages[hash]
    }
    this.loadedImages[hash] = new Promise((resolve, reject) => {
      const preloadImage = new Image()
      preloadImage.src = url
      return preloadImage.addEventListener('load', () => {
        this.loadedImages[hash] = true
        return resolve()
      })
    })
  }

  isLoaded (url) {
    // don't show for server-side otherwise it shows,
    // then hides, then shows again
    return (typeof window !== 'undefined') &&
      this.loadedImages[hashFn(url)] === true
  }

  getHash (url) {
    return hashFn(url)
  }

  isLoadedByHash (hash) {
    // don't show for server-side otherwise it shows,
    // then hides, then shows again
    return (typeof window !== 'undefined') &&
      this.loadedImages[hash] === true
  }

  getSrcByPrefix (prefix, param) {
    if (param == null) { param = {} }
    let { size, cacheBust } = param
    if (size == null) { size = 'small' }

    if (!prefix) {
      return ''
    }
    // FIXME have cdn url passed in...
    const userCdnUrl = ''
    let src = `${userCdnUrl}/${prefix}.${size}.jpg`
    if (cacheBust) {
      src += `?${cacheBust}`
    }
    return src
  }
}

// TODO: alternative to @additionalScript
// parseExif: (file, locationValueSubject, rotationValueSubject) =>
//   if file.type.indexOf('jpeg') isnt -1
//     @additionalScript.add(
//       'js', 'https://fdn.uno/d/scripts/exif-parser.min.js'
//     ).then ->
//       reader = new FileReader()
//       reader.onload = (e) ->
//         parser = window.ExifParser.create(e.target.result)
//         parser.enableSimpleValues true
//         result = parser.parse()
//         rotation = switch result.tags.Orientation
//                         when 3 then 'rotate-180'
//                         when 8 then 'rotate-270'
//                         when 6 then 'rotate-90'
//                         else ''
//         location = if result.tags.GPSLatitude \
//                    then {lat: result.tags.GPSLatitude, lon: result.tags.GPSLongitude} \
//                    else null
//         rotationValueSubject?.next rotation
//         locationValueSubject?.next location
//       reader.readAsArrayBuffer file
