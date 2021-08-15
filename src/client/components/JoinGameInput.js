import React from 'react'
import { Redirect } from 'react-router-dom'
import styled from 'styled-components'
import { Input } from 'reakit/Input'
import { Button } from 'reakit/Button'
import * as api from '../lib/api.js'

function JoinGameInput () {
  const [code, setCode] = React.useState('')
  const [joinGame, { joined, loading }] = useJoinGame(code)
  const handleCodeChange = React.useCallback(e => {
    const value = e.target.value
      .replace(/[^a-z]/gi, '')
      .toUpperCase()
      .slice(0, 4)
    setCode(value)
  }, [])
  const handleSubmit = React.useCallback(
    e => {
      e.preventDefault()
      if (loading) return
      joinGame()
    },
    [joinGame, loading]
  )
  if (joined) return <Redirect to={`/games/${encodeURIComponent(joined)}`} />
  return (
    <Form onSubmit={handleSubmit}>
      <Input
        disabled={loading}
        name='code'
        placeholder='Enter code to join'
        value={code}
        onChange={handleCodeChange}
      />
      <Button disabled={loading} type='submit'>
        Join
      </Button>
    </Form>
  )
}

export default JoinGameInput

/**
 * @param {string} code
 * @returns {[() => void, { joined: string?, error: Error?, loading: boolean }]}
 */
function useJoinGame (code) {
  const [state, setState] = React.useState({
    /** @type {string?} */
    joined: null,
    loading: false,
    /** @type {Error?} */
    error: null
  })
  const joinGame = React.useCallback(() => {
    setState({ joined: null, loading: true, error: null })
    api
      .joinGame(code)
      .then(code => setState({ joined: code, loading: false, error: null }))
      .catch(error => setState({ joined: null, loading: false, error }))
  }, [code])
  return [joinGame, state]
}

const Form = styled.form`
  display: flex;
  padding: 8px 0;
`
