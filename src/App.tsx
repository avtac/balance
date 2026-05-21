import type { ReactNode } from 'react'
import ConfigBuilder from './ConfigBuilder.tsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App(): ReactNode {
  return (
    <Router>
      <Routes>
        <Route path='/config' element={<ConfigBuilder />} />
        <Route path='/' element={<button onClick={() => window.location.href = '/config'}>Link</button>} />
      </Routes>
    </Router>
  )
}

export default App
