/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, useContext, useStream } from 'zorium'
import * as _ from 'lodash-es'

import context from '../../context'
let $masonryGrid

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default $masonryGrid = function ({ $elements, columnCounts }) {
  let $columns
  const { browser } = useContext(context)

  const { breakpoint } = useStream(() => ({
    breakpoint: browser.getBreakpoint()
  }))

  const columnCount = columnCounts[breakpoint || 'mobile'] || columnCounts.mobile
  if (columnCount === 1) {
    $columns = [$elements]
  } else {
    $columns = _.map(_.range(columnCount), columnIndex => _.filter($elements, (element, i) => (i % columnCount) === columnIndex))
  }

  return z('.z-masonry-grid', {
    style: {
      columnCount,
      webkitColumnCount: columnCount
    }
  },
  _.map($columns, $els => z('.column', {
    style: {
      width: `${100 / columnCount}%`
    }
  },
  _.map($els, $el => z('.row',
    $el))
  ))
  )
}
