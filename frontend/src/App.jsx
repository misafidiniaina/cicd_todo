import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginForm from "./pages/LoginPage"
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import RegisterForm from './pages/RegisterForm'

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App