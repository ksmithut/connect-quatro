import React from 'react'
import { Redirect } from 'react-router-dom'
import { Button } from 'reakit'
import * as api from '../lib/api.js'

function CreateGameButton () {
  const [createGame, { code, loading }] = useCreateGame()
  const handleClick = React.useCallback(
    e => {
      e.preventDefault()
      createGame()
    },
    [createGame]
  )
  if (code) return <Redirect to={`/games/${encodeURIComponent(code)}`} />
  return (
    <Button disabled={loading} onClick={handleClick}>
      Create Game
    </Button>
  )
}

export default CreateGameButton

/**
 * @returns {[() => void, { code: string?, error: Error?, loading: boolean }]}
 */
function useCreateGame () {
  const [state, setState] = React.useState({
    /** @type {string?} */
    code: null,
    loading: false,
    /** @type {Error?} */
    error: null
  })
  const createGame = React.useCallback(() => {
    setState({ code: null, loading: true, error: null })
    api
      .createGame()
      .then(code => setState({ code, loading: false, error: null }))
      .catch(error => setState({ code: null, loading: false, error }))
  }, [])
  return [createGame, state]
}
