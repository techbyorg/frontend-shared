import { z } from 'zorium'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $chartTooltip ({ color, label, x, y }) {
  return z('.z-chart-tooltip', [
    label && z('.label', label),
    z('.x', x),
    z('.y', [
      color && z('.color', { style: { background: color } }),
      z('.value', y)
    ])
  ])
}
