import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './Pages/Home'
import SquareRoot from './Pages/SquareRoot'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="squareroot" element={<SquareRoot/>}></Route>
      </Routes>
    </Router>
  )
}

export default App
