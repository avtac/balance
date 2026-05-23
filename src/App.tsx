import type { ReactNode } from 'react'
import ConfigBuilder from './pages/config/ConfigBuilder.tsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Balancr from './pages/home/Balancr.tsx'

function App(): ReactNode {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Balancr />} />
        <Route path='/config' element={<ConfigBuilder />} />
      </Routes>
    </Router>
  )
}

export default App
