import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { createGlobalStyle } from 'styled-components'
import HomePage from './pages/HomePage.js'
import GamePage from './pages/GamePage.js'

const GlobalStyle = createGlobalStyle`
  html,
  body {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
    background-color: #f0f0f0;
    color: #0f0f0f;
  }
  #root {
    height: 100vh;
    width: 100vw;
  }
`

function App () {
  return (
    <>
      <GlobalStyle />
      <Switch>
        <Route path='/' exact>
          <HomePage />
        </Route>
        <Route path='/games/:code' exact>
          <GamePage />
        </Route>
      </Switch>
    </>
  )
}

export default App
