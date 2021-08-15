import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import * as api from '../lib/api.js'
import Board from './Board.js'

/**
 * @param {{ code: string }} props
 */
function Game ({ code }) {
  const { game, version, playerId } = useGame(code)
  const isYourTurn =
    game?.state === 'started' && game?.players[game.current] === playerId
  const handleColumnClick = React.useCallback(
    column => {
      if (!isYourTurn) return
      api.placeToken(code, { version, column })
    },
    [code, version, isYourTurn]
  )
  if (!game || !playerId) return null
  const playerIndex = game.players.indexOf(playerId)
  return (
    <>
      {game.state === 'waiting' && <h1>{code}</h1>}
      <PlayerIndicator playerIndex={playerIndex} />
      <Board key='test' board={game.board} onColumnClick={handleColumnClick} />
      <p>&nbsp;{isYourTurn && 'It is your turn'}&nbsp;</p>
      {game.state === 'finished' && <Link to='/'>Game Finished!</Link>}
    </>
  )
}

export default Game

/**
 * @param {string} code
 * @returns
 */
function useGame (code) {
  const [state, setState] = React.useState({
    /** @type {import('../lib/api').Game?} */
    game: null,
    version: 0,
    /** @type {string?} */
    playerId: null
  })
  React.useEffect(() => {
    return api.watchGame(code, {
      onOpen () {
        console.log('open')
      },
      onUpdate ({ game, version, playerId }) {
        setState({ game, version, playerId })
      },
      onDone () {
        console.log('done')
      },
      onError (event) {
        console.log('error', event)
      }
    })
  }, [])
  return state
}

/**
 * @type {import('styled-components').StyledComponent<'div', any, any>}
 */
const PlayerIndicator = styled.div.attrs(
  /**
   * @param {object} props
   * @param {number} props.playerIndex
   */
  props => ({
    color: props.playerIndex === 0 ? '#edd902' : '#f43430'
  })
)`
  height: 50px;
  width: 50px;
  margin: 5px;
  box-sizing: border-box;
  border-radius: 25px;
  border: 3px solid black;
  background-color: ${p => p.color};
`
