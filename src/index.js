import React from 'react'
import '@fontsource/roboto'
import './index.css'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './redux/store'
import { createRoot } from 'react-dom/client';
import { LocaleProvider } from './locales'
import App from './App'

// const root = ReactDOM.createRoot(document.getElementById('root'))
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <LocaleProvider>
      <Provider store={store}>
        <Router>
          <App />
        </Router>
      </Provider>
    </LocaleProvider>
  </React.StrictMode>,
)
