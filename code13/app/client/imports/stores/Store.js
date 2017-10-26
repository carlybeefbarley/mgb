/**
 * Stores are like stateful Components, except they only contain state. They have no render() method.
 * Use a Store to lift state out of your component and share it with other components.
 *
 * Q: Why not use a Container Component?
 * A: Container Component state cannot be used outside of render(). Stores can be used in any module.
 *
 * The Store API is inspired by React.Component:
 *
 *   // Called when the store calls setState(), before applying the state change.
 *   // Return an object here to REPLACE the incoming state change with your own.
 *   storeWillReceiveState(nextState) {}
 *
 *   // Called before notifying store subscribers of the new state.
 *   storeWillUpdate(prevState, nextState) {}
 *
 *   // Called after notifying store subscribers of the new state.
 *   storeDidUpdate(prevState) {}
 *
 *   setState(partialState)
 *
 *   this.state
 *
 * @see `withStores` to connect stores to components, creating Container Components.
 *
 * @example
 * class Counter extends Store {
 *   // When using `withStores` the `storeShape` will be added to the wrapped component's `propTypes`.
 *   static storeShape = { count: PropTypes.number }
 *
 *   state = { count: 1 }
 *
 *   increment = () => this.setState({ count: this.state.count + 1 })
 * }
 *
 * const counter = new Counter()
 * const logCount = state => console.log('Count is', state.counter)
 *
 * console.log(counter.state)
 * // => 1
 *
 * // listen to changes
 * counter.subscribe(logCount)
 *
 * counter.increment()
 * // => 2 (from logCount)
 *
 * // clean up when done
 * counter.subscribe(logCount)
 */
class Store {
  __storeListeners = []

  state = {}

  storeWillReceiveState(nextState) {}

  storeWillUpdate(prevState, nextState) {}

  storeDidUpdate(prevState) {}

  // Replicate component lifecycle methods during render()
  setState(partialState) {
    const type = typeof partialState
    if (type !== 'object' || partialState === null) {
      const name = this.constructor.name
      console.error(`${name}.setState(partialState) partialState must be a plain object, got:`, type)
    }
    const prevState = { ...this.state }
    const nextState = { ...prevState, ...partialState }
    const moreState = this.storeWillReceiveState(nextState)

    this.state = moreState ? { ...nextState, ...moreState } : nextState

    this.storeWillUpdate(this.state)

    this.__storeListeners.forEach(listener => listener(this.state))

    this.storeDidUpdate(prevState)
  }

  subscribe = fn => {
    this.__storeListeners.push(fn)
  }

  unsubscribe = fn => {
    this.__storeListeners = this.__storeListeners.filter(listener => listener !== fn)
  }
}

export default Store
