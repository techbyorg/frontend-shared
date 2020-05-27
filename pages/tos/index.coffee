{z, useContext} = require 'zorium'

$appBar = require '../../components/app_bar'
$buttonBack = require '../../components/button_back'
$privacy = require '../../components/privacy'
colors = require '../../colors'
context = require '../../context'

if window?
  require './index.styl'

module.exports = $tosPage = ->
  {lang} = useContext context

  z '.p-tos',
    z $appBar, {
      title: lang.get 'tosPage.title'
      $topLeftButton: z $buttonBack, {
        color: colors.$header500Icon
      }
    }
    z $tos
