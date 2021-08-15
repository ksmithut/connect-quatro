/**
 * @typedef {0|1} Cell
 */

/**
 * @typedef {Cell[][]} Board
 */

/**
 * @typedef {[number, number]} Coordinate
 */

/**
 * @param {Board} board
 * @param {number} [maxHeight=6]
 */
export function isFull (board, maxHeight = 6) {
  return board.every(column => column.length >= maxHeight)
}

/**
 * @param {Board} board
 * @returns {Coordinate[]?}
 */
export function findWinningLine (board) {
  for (const [c, column] of board.entries()) {
    for (const [r, value] of column.entries()) {
      /** @type {Coordinate[]} */
      const up = [
        [c, r],
        [c, r + 1],
        [c, r + 2],
        [c, r + 3]
      ]
      if (coordinatesMatchValue(board, up, value)) return up
      /** @type {Coordinate[]} */
      const upRight = [
        [c, r],
        [c + 1, r + 1],
        [c + 2, r + 2],
        [c + 3, r + 3]
      ]
      if (coordinatesMatchValue(board, upRight, value)) return upRight
      /** @type {Coordinate[]} */
      const right = [
        [c, r],
        [c + 1, r],
        [c + 2, r],
        [c + 3, r]
      ]
      if (coordinatesMatchValue(board, right, value)) return right
      /** @type {Coordinate[]} */
      const downRight = [
        [c, r],
        [c + 1, r - 1],
        [c + 2, r - 2],
        [c + 3, r - 3]
      ]
      if (coordinatesMatchValue(board, downRight, value)) return downRight
    }
  }
  return null
}

/**
 *
 * @param {Board} board
 * @param {Coordinate[]} coordinates
 * @param {Cell} value
 */
function coordinatesMatchValue (board, coordinates, value) {
  return coordinates.every(([c, r]) => board[c]?.[r] === value)
}
