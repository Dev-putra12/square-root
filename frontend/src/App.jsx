import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './Pages/Home'
import SquareRoot from './Pages/SquareRoot'
import Translate from './Pages/translate/Translate'
import Weather from './Pages/Weather'
import Login from './Pages/login/Login'

function App() {
  return (
    <Router>
      <Routes>

        <Route path="login" element={<Login/>}></Route>
        <Route path="/" element={<Home/>}></Route>
        <Route path="squareroot" element={<SquareRoot/>}></Route>
        <Route path="weather" element={<Weather/>}></Route>
        <Route path="translate" element={<Translate/>}></Route>
      </Routes>
    </Router>
  )
}

export default App
