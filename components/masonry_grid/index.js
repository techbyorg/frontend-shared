import { z, useContext, useStream } from 'zorium'
import * as _ from 'lodash-es'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $masonryGrid (props) {
  const { $elements, columnCounts = {}, columnGapPxs = {} } = props
  const { browser } = useContext(context)

  const { breakpoint } = useStream(() => ({
    breakpoint: browser.getBreakpoint()
  }))

  const columnCount = columnCounts[breakpoint || 'mobile'] || columnCounts.mobile
  const columnGapPx = columnGapPxs[breakpoint || 'mobile'] || columnGapPxs.mobile || 0
  let $columns
  if (columnCount === 1) {
    $columns = [$elements]
  } else {
    $columns = _.map(_.range(columnCount), (columnIndex) =>
      _.filter($elements, (element, i) =>
        (i % columnCount) === columnIndex
      )
    )
  }

  return z('.z-masonry-grid', {
    style: {
      columnCount,
      webkitColumnCount: columnCount
    }
  }, _.map($columns, ($els, i) => {
    const isFirst = i === 0
    const isLast = i === $columns.length - 1
    return z('.column', {
      style: {
        width: `${100 / columnCount}%`,
        paddingLeft: !isFirst && `${columnGapPx / 2}px`,
        paddingRight: !isLast && `${columnGapPx / 2}px`
      }
    }, _.map($els, ($el) => z('.row', $el)))
  }))
}
