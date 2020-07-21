import { useMemo } from 'zorium'

let localCssVariables
let localStyle
if (globalThis?.window) {
  localStyle = getComputedStyle(document.body)
}

export default function (callback, dependencies) {
  useMemo(() => {
    const cssVariables = callback()
    if (globalThis?.window) {
      localStyle = getComputedStyle(document.body)
      const $$style = document.getElementById('css-variables')
      if ($$style) {
        $$style.innerHTML = `:root {${cssVariables}}`
      }
    } else {
      localCssVariables = cssVariables
    }
  }, dependencies || [])
}

export function getRawColor (cssVariable) {
  return localStyle?.getPropertyValue(cssVariable)
}

export function generateStaticHtml () {
  return `<style id='css-variables'>:root {${localCssVariables}}</style>`
}
