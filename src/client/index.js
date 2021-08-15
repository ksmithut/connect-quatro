import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'reakit'
import * as reakitSystemBootstrap from 'reakit-system-bootstrap'
import App from './App.js'

ReactDOM.render(
  <BrowserRouter>
    <Provider unstable_system={reakitSystemBootstrap}>
      <App />
    </Provider>
  </BrowserRouter>,
  document.getElementById('root')
)
