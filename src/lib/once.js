/**
 * Given a function that takes no arguments, returns a function that can be
 * called many times, but it only called the given function once. It's like
 * memoizing, but it only works with functions that take no arguments.
 * @template TReturnValue
 * @param {() => TReturnValue} fn
 */
export function once (fn) {
  let called = false
  /** @type {TReturnValue} */
  let value
  return () => {
    if (!called) {
      value = fn()
      called = true
    }
    return value
  }
}
