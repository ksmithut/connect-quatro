import React from 'react'
import { useParams } from 'react-router-dom'
import Game from '../components/Game.js'
import CenterContainer from '../components/CenterContainer.js'

function GamePage () {
  // @ts-ignore
  const { code } = useParams()
  return (
    <CenterContainer>
      <Game code={code} />
    </CenterContainer>
  )
}

export default GamePage
