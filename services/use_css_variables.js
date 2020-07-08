import { useMemo } from 'zorium'

let localCssVariables
let localStyle
if (globalThis?.window) {
  localStyle = getComputedStyle(document.body)
}

export default function (callback, dependencies) {
  const cssVariables = useMemo(callback, (dependencies || []))
  if (globalThis?.window) {
    localStyle = getComputedStyle(document.body)
    const $$style = document.getElementById('css-variables')
    if ($$style) {
      $$style.innerHTML = `:root {${cssVariables}}`
    }
  } else {
    localCssVariables = cssVariables
  }
}

export function getRawColor (cssVariable) {
  return localStyle.getPropertyValue(cssVariable)
}

export function generateStaticHtml () {
  return `<style id='css-variables'>:root {${localCssVariables}}</style>`
}
