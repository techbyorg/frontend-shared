import { z, classKebab, useContext, useMemo, useRef } from 'zorium'
import * as _ from 'lodash-es'

import $spinner from '../spinner'
import useRefSize from '../../services/use_ref_size'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

// if it's lightweight enough, for long tables we could use
// https://github.com/mckervinc/react-fluid-table
// so i'm using same api to make for easy replacement
export default function $table (props) {
  const { data, columns, rowHrefFn, mobileRowRenderer, breakpoint } = props
  const { router } = useContext(context)

  function getStyle ({ width, isFlex }) {
    if (isFlex) {
      return { minWidth: `${width}px`, flex: 1 }
    } else if (width) {
      return { width: width ? `${width}px` : undefined }
    }
  }

  const columnsWithRefAndSize = useMemo(() => {
    return _.map(columns, function (column) {
      // so we don't have to calculate size on every td
      // for components that need size (eg tags)
      if (column.passThroughSize) {
        const $$ref = useRef()
        const size = useRefSize($$ref)
        column = _.defaults({ $$ref, size }, column)
      }
      return column
    })
  }, [columns])

  const isMobile = breakpoint === 'mobile'
  const isMobileView = isMobile && mobileRowRenderer

  return z('.z-table', {
    className: classKebab({ isMobile, hasRowClick: rowHrefFn })
  }, [
    !isMobileView &&
      z('.thead', {
        style: {
          minWidth: `${_.sumBy(columns, 'width')}px`
        }
      }, _.map(columnsWithRefAndSize, ({ name, width, isFlex, $$ref }) =>
        z('.th', { style: getStyle({ width, isFlex }) }, [
          z('.content', { ref: $$ref }, name)
        ])
      )),
    z('.tbody', [
      !data && z($spinner),
      _.map(data, (row, i) => {
        if (isMobile && mobileRowRenderer) {
          return router.linkIfHref(z('.tr-mobile', {
            href: rowHrefFn && rowHrefFn(i)
          }, mobileRowRenderer({ row })))
        } else {
          return router.linkIfHref(z('.tr', {
            href: rowHrefFn && rowHrefFn(i)
          }, _.map(columnsWithRefAndSize, function (column) {
            const { key, width, size, isFlex, content } = column
            return z('.td', { style: getStyle({ width, isFlex }) },
              content ? content({ row, size }) : row[key])
          })))
        }
      })
    ])
  ])
}
