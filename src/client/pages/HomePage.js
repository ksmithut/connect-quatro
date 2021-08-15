import React from 'react'
import CreateGameButton from '../components/CreateGameButton.js'
import JoinGameInput from '../components/JoinGameInput.js'
import CenterContainer from '../components/CenterContainer.js'

function HomePage () {
  return (
    <CenterContainer>
      <h1>ConnectQuatro</h1>
      <CreateGameButton />
      <JoinGameInput />
    </CenterContainer>
  )
}

export default HomePage
