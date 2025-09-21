// Home cleansed: only navbar + routes with LiveMap as home
import LiveMap from './LiveMap.jsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Student from './pages/Student.jsx'
import Teacher from './pages/Teacher.jsx'
import ParentGuardian from './pages/ParentGuardian.jsx'
import InstitutionTeams from './pages/InstitutionTeams.jsx'
import Authority from './pages/Authority.jsx'
import HomePage from './pages/HomePage.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<div className="mx-auto max-w-5xl px-4 py-8">About AlertHub</div>} />
        <Route path="/map" element={<LiveMap />} />
  <Route path="/register" element={<Register />} />
  <Route path="/login" element={<Login />} />
        <Route path="/student" element={<Student />} />
        <Route path="/teacher" element={<Teacher />} />
        <Route path="/parent" element={<ParentGuardian />} />
        <Route path="/institution" element={<InstitutionTeams />} />
        <Route path="/authority" element={<Authority />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
