import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './Pages/Home'
import SquareRoot from './Pages/SquareRoot'
import Translate from './Pages/Translate'
import Weather from './Pages/Weather'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="squareroot" element={<SquareRoot/>}></Route>
        <Route path="weather" element={<Weather/>}></Route>
        <Route path="translate" element={<Translate/>}></Route>
      </Routes>
    </Router>
  )
}

export default App
