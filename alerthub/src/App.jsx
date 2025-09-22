// Home cleansed: only navbar + routes with LiveMap as home
import LiveMap from './LiveMap.jsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Student from './pages/Student.jsx'
import StudentDashboard from './pages/StudentDashboard.js'
import Teacher from './pages/Teacher.jsx'
import TeacherReports from './pages/TeacherReports.jsx'
import TeacherQuizzes from './pages/TeacherQuizzes.jsx'
import TeacherResources from './pages/TeacherResources.jsx'
import TeacherMaps from './pages/TeacherMaps.jsx'
import ParentGuardian from './pages/ParentGuardian.jsx'
import ParentDashboard from './pages/ParentDashboard.js'
import StudentQuiz from './pages/StudentQuiz.jsx'
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
  {/* Existing detail routes */}
  <Route path="/student" element={<Student />} />
  <Route path="/teacher" element={<Teacher />} />
  <Route path="/teacher/reports" element={<TeacherReports />} />
  <Route path="/teacher/quizzes" element={<TeacherQuizzes />} />
  <Route path="/teacher/resources" element={<TeacherResources />} />
  <Route path="/teacher/maps" element={<TeacherMaps />} />
  <Route path="/parent" element={<ParentGuardian />} />
  <Route path="/institution" element={<InstitutionTeams />} />
  <Route path="/authority" element={<Authority />} />
  {/* New dashboard aliases for role-based redirect */}
  <Route path="/student-dashboard" element={<StudentDashboard />} />
  <Route path="/teacher-dashboard" element={<Teacher />} />
  <Route path="/parent-dashboard" element={<ParentDashboard />} />
  <Route path="/institution-dashboard" element={<InstitutionTeams />} />
  <Route path="/authority-dashboard" element={<Authority />} />
  <Route path="/quiz" element={<StudentQuiz />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
