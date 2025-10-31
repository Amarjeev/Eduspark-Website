// index.js
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import RouterConfig from './app_routes/RouterConfig'

import { Provider } from 'react-redux'
import { store } from './redux/store'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterConfig />
    </Provider>
  </StrictMode>
)
