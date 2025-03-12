import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import App from './App.jsx'
import Parent from './modules/parent'

createRoot(document.getElementById('root')).render(
  <Parent />
)
