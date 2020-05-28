import _defaults from 'lodash/defaults'
import _mapValues from 'lodash/mapValues'

$black12 = 'rgba(0, 0, 0, 0.12)'
$black26 = 'rgba(0, 0, 0, 0.26)'
$black54 = 'rgba(0, 0, 0, 0.54)'
$black70 = 'rgba(0, 0, 0, 0.70)'
$black87 = 'rgba(0, 0, 0, 0.87)'
$white = '#ffffff'
$white54 = 'rgba(255, 255, 255, 0.54)'

colors = _defaults {
  default:
    '--header-500': '#ffffff' # t100
    '--header-500-text': $black87
    '--header-500-text-54': $black54
    '--header-500-icon': '#757575'

    '--primary-50': 'rgba(63, 113, 222, 0.04)'
    '--primary-100': '#C5D4F5'
    '--primary-200': '#9FB8EF'
    '--primary-300': '#799CE8'
    '--primary-400': '#5C86E3'
    '--primary-500': '#3F71DE'
    '--primary-600': '#3969DA'
    '--primary-700': '#315ED5'
    '--primary-800': '#2954D1'
    '--primary-900': '#1B42C8'
    '--primary-100-text': $black87
    '--primary-200-text': $black87
    '--primary-300-text': '#FAFAFA'
    '--primary-400-text': '#FAFAFA'
    '--primary-500-text': '#FAFAFA'
    '--primary-600-text': '#FAFAFA'
    '--primary-700-text': '#FAFAFA'
    '--primary-800-text': '#FAFAFA'
    '--primary-900-text': '#FAFAFA'
    '--primary-900-text-54': 'rgba(250, 250, 250, 0.54)'

    '--secondary-50': '#E0F7F7'
    '--secondary-100': '#B3ECEC'
    '--secondary-200': '#80E0DF'
    '--secondary-300': '#4DD3D2'
    '--secondary-400': '#26C9C8'
    '--secondary-500': '#00C0BE'
    '--secondary-600': '#00BAB8'
    '--secondary-700': '#00B2AF'
    '--secondary-800': '#00AAA7'
    '--secondary-900': '#009C99'
    '--secondary-100-text': $black87
    '--secondary-200-text': $black87
    '--secondary-300-text': $black87
    '--secondary-400-text': $black87
    '--secondary-500-text': $white
    '--secondary-600-text': $white
    '--secondary-700-text': $white
    '--secondary-800-text': $white
    '--secondary-900-text': $white

    '--bg-color': '#ffffff'
    '--bg-color-alt-1': '#F8F8F8' # changed from f5f5f5
    '--bg-color-alt-2': '#EEEEEE'
    '--bg-backdrop': 'rgba(250, 250, 250, 0.73)'
    '--bg-text': $black70
    '--bg-text-6': 'rgba(0, 0, 0, 0.06)'
    '--bg-text-12': $black12
    '--bg-text-26': $black26
    '--bg-text-38': 'rgba(0, 0, 0, 0.38)'
    '--bg-text-54': $black54
    '--bg-text-60': 'rgba(0, 0, 0, 0.6)'
    '--bg-text-70': $black70
    '--bg-text-87': $black87

    '--quaternary-500': '#fedf57'
    '--quaternary-500-text': $white
    '--test-color': '#000' # don't change



  '$header500': 'var(--header-500)'
  '$header500Text': 'var(--header-500-text)'
  '$header500Text54': 'var(--header-500-text54)'
  '$header500Icon': 'var(--header-500-icon)'

  '$primary50': 'var(--primary-50)'
  '$primary100': 'var(--primary-100)'
  '$primary200': 'var(--primary-200)'
  '$primary300': 'var(--primary-300)'
  '$primary400': 'var(--primary-400)'
  '$primary500': 'var(--primary-500)'
  '$primary50096': 'var(--primary-50096)'
  '$primary600': 'var(--primary-600)'
  '$primary700': 'var(--primary-700)'
  '$primary800': 'var(--primary-800)'
  '$primary900': 'var(--primary-900)'
  '$primaryMain': 'var(--primary-500)'

  '$primary100Text': 'var(--primary-100-text)'
  '$primary200Text': 'var(--primary-200-text)'
  '$primary300Text': 'var(--primary-300-text)'
  '$primary400Text': 'var(--primary-400-text)'
  '$primary500Text': 'var(--primary-500-text)'
  '$primary500Text54': 'var(--primary-500-text-54)'
  '$primary600Text': 'var(--primary-600-text)'
  '$primary700Text': 'var(--primary-700-text)'
  '$primary800Text': 'var(--primary-800-text)'
  '$primary900Text': 'var(--primary-900-text)'
  '$primaryMainText': 'var(--primary-900-text)'
  '$primaryMainText54': 'var(--primary-900-text-54)'

  '$secondary50': 'var(--secondary-50)'
  '$secondary100': 'var(--secondary-100)'
  '$secondary200': 'var(--secondary-200)'
  '$secondary300': 'var(--secondary-300)'
  '$secondary400': 'var(--secondary-400)'
  '$secondary500': 'var(--secondary-500)'
  '$secondary600': 'var(--secondary-600)'
  '$secondary700': 'var(--secondary-700)'
  '$secondary800': 'var(--secondary-800)'
  '$secondary900': 'var(--secondary-900)'
  '$secondaryMain': 'var(--secondary-700)'

  '$secondary100Text': 'var(--secondary-100-text)'
  '$secondary200Text': 'var(--secondary-200-text)'
  '$secondary300Text': 'var(--secondary-300-text)'
  '$secondary400Text': 'var(--secondary-400-text)'
  '$secondary500Text': 'var(--secondary-500-text)'
  '$secondary600Text': 'var(--secondary-600-text)'
  '$secondary700Text': 'var(--secondary-700-text)'
  '$secondary800Text': 'var(--secondary-800-text)'
  '$secondary900Text': 'var(--secondary-900-text)'
  '$secondaryMainText': 'var(--secondary-700-text)'

  '$bgColor': 'var(--bg-color)'
  '$bgColorAlt1': 'var(--bg-color-alt-1)'
  '$bgColorAlt2': 'var(--bg-color-alt-2)'
  '$bgBackdrop': 'var(--bg-backdrop)'

  # '$quaternary50': 'var(--quaternary-50)'
  # '$quaternary100': 'var(--quaternary-100)'
  # '$quaternary200': 'var(--quaternary-200)'
  # '$quaternary300': 'var(--quaternary-300)'
  # '$quaternary400': 'var(--quaternary-400)'
  '$quaternary500': 'var(--quaternary-500)'
  # '$quaternary600': 'var(--quaternary-600)'
  # '$quaternary700': 'var(--quaternary-700)'
  # '$quaternary800': 'var(--quaternary-800)'
  # '$quaternary900': 'var(--quaternary-900)'
  # # '$quaternary90012': 'var(--quaternary-90012)'
  # # '$quaternary90054': 'var(--quaternary-90054)'
  # # '$quaternary100Text': 'var(--quaternary-100-text)'
  # # '$quaternary200Text': 'var(--quaternary-200-text)'
  # # '$quaternary300Text': 'var(--quaternary-300-text)'
  # # '$quaternary400Text': 'var(--quaternary-400-text)'
  # '$quaternary500Text': 'var(--quaternary-500-text)'
  # # '$quaternary500Text70': 'var(--quaternary-500-text-70)'
  # # '$quaternary600Text': 'var(--quaternary-600-text)'
  # # '$quaternary700Text': 'var(--quaternary-700-text)'
  # # '$quaternary800Text': 'var(--quaternary-800-text)'
  # # '$quaternary900Text': 'var(--quaternary-900-text)'

  '$bgText': 'var(--bg-text)'
  '$bgText6': 'var(--bg-text-6)'
  '$bgText12': 'var(--bg-text-12)'
  '$bgText26': 'var(--bg-text-26)'
  '$bgText38': 'var(--bg-text-38)'
  '$bgText54': 'var(--bg-text-54)'
  '$bgText60': 'var(--bg-text-60)'
  '$bgText70': 'var(--bg-text-70)'
  '$bgText87': 'var(--bg-text-87)'

  '$tabSelected': $white
  '$tabUnselected': '#1a1a1a'

  '$tabSelectedAlt': $white
  '$tabUnselectedAlt': $white54

  '$transparent': 'rgba(0, 0, 0, 0)'
  '$common': '#3e4447'
  '$white': $white
  '$red500': '#F44336'
  '$amber500': '#FFC107'

  getRawColor: (color) ->
    if typeof color is 'string' and matches = color.match(/\(([^)]+)\)/)
      colors.default[matches[1]]
    else
      color
}

# no css-variable support
if window?
  $$el = document.getElementById('css-variable-test')
  isCssVariableSupported = not $$el or
    window.CSS?.supports?('--fake-var', 0) or
    getComputedStyle($$el, null)?.backgroundColor is 'rgb(0, 0, 0)'
  unless isCssVariableSupported
    colors = _mapValues colors, (color, key) ->
      colors.getRawColor color

module.exports = colors
