import { RouterProvider } from 'react-router-dom'
import './App.css'
import { AppStateProvider } from './app/AppState'
import { router } from './app/router'

function App() {
  return <AppStateProvider><RouterProvider router={router} /></AppStateProvider>
}

export default App
