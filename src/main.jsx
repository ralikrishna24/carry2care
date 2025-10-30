import React from 'react'
import { createRoot } from 'react-dom/client'
import Carry2CareApp from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Carry2CareApp />
  </React.StrictMode>
)