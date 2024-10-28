import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './Pages/Home'
import SquareRoot from './Pages/SquareRoot'
import Translate from './Pages/translate/Translate'
import Weather from './Pages/Weather'
import Login from './Pages/login/Login'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="login" element={<Login/>}></Route>
        {/* Home */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>}/>
        {/* Square Root */}
        <Route path="/squareroot" element={
          <ProtectedRoute>
            <SquareRoot/>
          </ProtectedRoute>}>
        </Route>
        {/* Weather */}
        <Route path="weather" element={
          <ProtectedRoute>
            <Weather/>
          </ProtectedRoute>}>
        </Route>
        {/* Translate */}
        <Route path="translate" element={
          <ProtectedRoute>
            <Translate/>
          </ProtectedRoute>}>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
