import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

// Ensure the root element exists
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

// Create React root and render the app
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Hide loading screen once React has mounted
setTimeout(() => {
  const loadingScreen = document.getElementById('loading-screen')
  if (loadingScreen) {
    loadingScreen.style.opacity = '0'
    loadingScreen.style.transition = 'opacity 0.3s ease'
    setTimeout(() => {
      loadingScreen.remove()
    }, 300)
  }
}, 500)