/**
 * @param {import('express').RequestHandler} handler
 * @returns {import('express').RequestHandler}
 */
export default function expressWrap (handler) {
  return (req, res, next) => {
    return Promise.resolve()
      .then(() => handler(req, res, next))
      .catch(next)
  }
}
