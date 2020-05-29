import {z, useContext, useStream} from 'zorium'
import * as _ from 'lodash-es'

import context from '../../context'

if window?
  require './index.styl'

module.exports = $masonryGrid = ({$elements, columnCounts}) ->
  {browser} = useContext context

  {breakpoint} = useStream ->
    breakpoint: browser.getBreakpoint()

  columnCount = columnCounts[breakpoint or 'mobile'] or columnCounts['mobile']
  if columnCount is 1
    $columns = [$elements]
  else
    $columns = _.map _.range(columnCount), (columnIndex) ->
      _.filter $elements, (element, i) ->
        i % columnCount is columnIndex

  z '.z-masonry-grid', {
    style:
      columnCount: columnCount
      webkitColumnCount: columnCount
  },
    _.map $columns, ($els) ->
      z '.column', {
        style:
          width: "#{100 / columnCount}%"
      },
        _.map $els, ($el) ->
          z '.row',
            $el
