import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/app.css'
import './styles/calendar.css'
import './styles/date-time-fields.css'
import './styles/controls.css'

// Find <div id="root"> from index.html and render the whole React app inside it
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
