/**
 * @typedef {0|1} Cell
 */

/**
 * @typedef {Cell[][]} Board
 */

/**
 * @typedef {object} Game
 * @property {string[]} players
 * @property {0|1} current
 * @property {Board} board
 * @property {'waiting'|'started'|'finished'} state
 */

/**
 * @typedef {object} JoinAction
 * @property {'JOIN'} type
 * @property {object} payload
 * @property {string} payload.playerId
 */

/**
 * @typedef {object} ResetAction
 * @property {'RESET'} type
 * @property {object} payload
 * @property {string} payload.playerId
 */

/**
 * @typedef {object} PlaceAction
 * @property {'PLACE'} type
 * @property {object} payload
 * @property {string} payload.playerId
 * @property {number} payload.column
 */

/**
 * @typedef {JoinAction | PlaceAction | ResetAction} GameAction
 */

/**
 * @returns {Board}
 */
function createBoard () {
  return [[], [], [], [], [], [], []]
}

/**
 * @param {string} playerId
 * @returns {Game}
 */
export function initialize (playerId) {
  return {
    players: [playerId],
    board: createBoard(),
    current: 0,
    state: 'waiting'
  }
}

/**
 * @param {Game} state
 * @param {GameAction} action
 * @returns {Game}
 */
export function reducer (state, action) {
  switch (action?.type) {
    case 'JOIN': {
      if (state.state !== 'waiting') return state
      if (state.players[0] === action.payload.playerId) return state
      return {
        ...state,
        players: [state.players[0], action.payload.playerId],
        state: 'started'
      }
    }
    case 'PLACE': {
      const { column, playerId } = action.payload
      if (state.state !== 'started') return state
      const currentPlayerId = state.players[state.current]
      if (playerId !== currentPlayerId) return state
      const newBoard = state.board.slice()
      if (!newBoard[column]) return state
      if (newBoard[column].length >= 6) return state
      newBoard[column] = newBoard[column].concat(state.current)
      const isFinished =
        Boolean(findWinningLine(newBoard)) || isFull(newBoard, 6)
      return {
        ...state,
        board: newBoard,
        current: state.current === 0 ? 1 : 0,
        state: isFinished ? 'finished' : state.state
      }
    }
    case 'RESET': {
      if (state.state !== 'finished') return state
      if (!state.players.includes(action.payload.playerId)) return state
      return {
        players: [state.players[1], state.players[0]],
        current: 0,
        board: createBoard(),
        state: 'started'
      }
    }
    default:
      return state
  }
}

/**
 * @typedef {[number, number]} Coordinate
 */

/**
 * @param {Board} board
 * @param {number} [maxHeight=6]
 */
function isFull (board, maxHeight = 6) {
  return board.every(column => column.length >= maxHeight)
}

/**
 * @param {Board} board
 * @returns {Coordinate[]?}
 */
function findWinningLine (board) {
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
