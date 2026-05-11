import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

if (!window.storage) {
  window.storage = {
    get: (key) => Promise.resolve({ value: localStorage.getItem(key) }),
    set: (key, value) => { localStorage.setItem(key, value); return Promise.resolve() },
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
