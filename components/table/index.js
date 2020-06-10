import {z, classKebab, useMemo, useRef} from 'zorium'
import * as _ from 'lodash-es'

import $spinner from '../spinner'
import Environment from '../../services/environment'
import useRefSize from '../../services/use_ref_size'

if window?
  require './index.styl'

# if it's lightweight enough, for long tables we could use
# https://github.com/mckervinc/react-fluid-table
# so i'm using same api to make for easy replacement
export default $table = (props) ->
  {data, columns, onRowClick, mobileRowRenderer, breakpoint} = props
  getStyle = ({width, isFlex}) ->
    if isFlex
      {minWidth: "#{width}px", flex: 1}
    else if width
      {width: if width then "#{width}px"}

  columnsWithRefAndSize = useMemo ->
    _.map columns, (column) ->
      # so we don't have to calculate size on every td
      # for components that need size (eg tags)
      if column.passThroughSize
        $$ref = useRef()
        size = useRefSize $$ref
        column = _.defaults {$$ref, size}, column
      column
  , [columns]

  isMobile = breakpoint is 'mobile'

  z '.z-table', {
    className: classKebab {isMobile, hasRowClick: onRowClick}
  },
    if not isMobile or not mobileRowRenderer
      z '.thead', {
        style:
          minWidth: "#{_.sumBy(columns, 'width')}px"
      },
        _.map columnsWithRefAndSize, ({name, width, isFlex, $$ref}) ->
          z '.th', {
            style: getStyle {width, isFlex}
          },
            z '.content', {ref: $$ref},
              name

    z '.tbody',
      unless data?
        z $spinner
      _.map data, (row, i) ->
        if isMobile and mobileRowRenderer
          z '.tr-mobile', {
            onclick: (e) ->
              onRowClick e, i
          },
            mobileRowRenderer {row}
        else
          z '.tr', {
            onclick: (e) ->
              onRowClick e, i
          },
            _.map columnsWithRefAndSize, (column) ->
              {key, name, width, size, isFlex, content} = column
              z '.td', {
                style: getStyle {width, isFlex}
              },
                if content
                  content {row, size}
                else
                  row[key]
