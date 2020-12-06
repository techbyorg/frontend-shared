import { z, useLayoutEffect, useRef } from 'zorium'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $snackBar ({ $content, $actions }) {
  const $$ref = useRef()

  useLayoutEffect(() => {
    setTimeout(() => $$ref.current.classList.add('is-mounted'), 0)

    return () => {
      $$ref.current.classList.remove('is-mounted')
    }
  }, [])

  return z('.z-snack-bar', { ref: $$ref }, [
    z('.content', $content),
    $actions && z('.actions', $actions)
  ])
}
