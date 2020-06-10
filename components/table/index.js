/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, classKebab, useMemo, useRef } from 'zorium'
import * as _ from 'lodash-es'

import $spinner from '../spinner'
import Environment from '../../services/environment'
import useRefSize from '../../services/use_ref_size'
let $table

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

// if it's lightweight enough, for long tables we could use
// https://github.com/mckervinc/react-fluid-table
// so i'm using same api to make for easy replacement
export default $table = function (props) {
  const { data, columns, onRowClick, mobileRowRenderer, breakpoint } = props

  function getStyle ({ width, isFlex }) {
    if (isFlex) {
      return { minWidth: `${width}px`, flex: 1 }
    } else if (width) {
      return { width: width ? `${width}px` : undefined }
    }
  }

  const columnsWithRefAndSize = useMemo(() => _.map(columns, function (column) {
    // so we don't have to calculate size on every td
    // for components that need size (eg tags)
    if (column.passThroughSize) {
      const $$ref = useRef()
      const size = useRefSize($$ref)
      column = _.defaults({ $$ref, size }, column)
    }
    return column
  })
  , [columns])

  const isMobile = breakpoint === 'mobile'

  return z('.z-table', {
    className: classKebab({ isMobile, hasRowClick: onRowClick })
  },
  !isMobile || !mobileRowRenderer
    ? z('.thead', {
      style: {
        minWidth: `${_.sumBy(columns, 'width')}px`
      }
    },
    _.map(columnsWithRefAndSize, ({ name, width, isFlex, $$ref }) => z('.th', {
      style: getStyle({ width, isFlex })
    },
    z('.content', { ref: $$ref },
      name)
    ))
    ) : undefined,

  z('.tbody',
    (data == null)
      ? z($spinner) : undefined,
    _.map(data, function (row, i) {
      if (isMobile && mobileRowRenderer) {
        return z('.tr-mobile', {
          onclick (e) {
            return onRowClick(e, i)
          }
        },
        mobileRowRenderer({ row }))
      } else {
        return z('.tr', {
          onclick (e) {
            return onRowClick(e, i)
          }
        },
        _.map(columnsWithRefAndSize, function (column) {
          const { key, name, width, size, isFlex, content } = column
          return z('.td', {
            style: getStyle({ width, isFlex })
          },
          content
            ? content({ row, size })
            : row[key])
        }))
      }
    })))
}
