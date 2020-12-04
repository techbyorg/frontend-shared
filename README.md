# Install as git submodule
Since you might be changing code in here periodically... to make it easy, this repo should be a submodule of the individual projects
`git submodule add git@github.com:techbyorg/frontend-shared.git`
`npm install file:frontend-shared`

# Code style
More to come soonish

- all BehaviorSubject / Observable named ____Stream (eg valueStream)
  - if it's something that can be either stream or String/Bool/Number (useStream doesn't care), call it ____Streamy
- all Streams objects (has .stream and .next, is merged stream) named ____Streams (eg valueStreams)
- $$ and `ref` in name for dom refs (typically $$ref)
  - $$ without ref in name refers to an actual dom element (not {current: $$el})
- order
  - props
  - useContext
  - useErrorBoundary
  - useRef
  - useMemo for all observable instantiation / state prep
  - useEffect
    - be explicity about return for beforeUnmount, or use beforeUnmount fn
    - always include return, even if no fn (return null)
    - tbd if it's better to use this or rx.tap on a stream for side-effects
      - probably this
  - useStream for state
  - usecallback functions
  - normal functions?
  - z

In general don't use wildcard imports, but for lodash and RxJS do (tree shaking means it's the same as explicit imports, and naming / collisions (map, filter, etc...) of the two would be annoying)


# TODO:
- figure out better solution for stream arrays that have components with a stream.
  - eg array of items that have a checkbox with default value
  - ex edit_role/index.js, see `HACK` comments
    - currently just remounting components so it uses the new stream
  - also think fundraise filter_dialog has same issue (resetValueStream)
