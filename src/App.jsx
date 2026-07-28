import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Problem from './pages/Problem.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/problem/:id" element={<Problem />} />
    </Routes>
  )
}
