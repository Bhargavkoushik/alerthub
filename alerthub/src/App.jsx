// Home cleansed: only navbar + routes with LiveMap as home
import LiveMap from './LiveMap.jsx'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
import InstitutionDashboard from './pages/InstitutionDashboard.jsx'
import InstitutionReports from './pages/InstitutionReports.jsx'
import InstitutionMaps from './pages/InstitutionMaps.jsx'
import InstitutionBroadcasts from './pages/InstitutionBroadcasts.jsx'
import InstitutionAnalytics from './pages/InstitutionAnalytics.jsx'
import Authority from './pages/Authority.jsx'
import AuthorityAlerts from './pages/AuthorityAlerts.jsx'
import AlertVerification from './pages/AlertVerification.jsx'
import HomePage from './pages/HomePage.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import ChatbotWidget from './components/ChatbotWidget.jsx'
import Community from './pages/Community.jsx'

function ChatbotGate() {
  const location = useLocation()
  const path = location.pathname || '/'
  // Hide the floating chatbot on Parent and Home pages as requested
  const hide = path === '/' || path.startsWith('/parent')
  return hide ? null : <ChatbotWidget />
}

function App() {
  return (
    <BrowserRouter>
      <ChatbotGate />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<div className="mx-auto max-w-5xl px-4 py-8">About AlertHub</div>} />
        <Route path="/map" element={<LiveMap />} />
  <Route path="/community" element={<Community />} />
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
  <Route path="/institution" element={<InstitutionDashboard />} />
  <Route path="/institution/reports" element={<InstitutionReports />} />
  <Route path="/institution/maps" element={<InstitutionMaps />} />
  <Route path="/institution/broadcasts" element={<InstitutionBroadcasts />} />
  <Route path="/institution/analytics" element={<InstitutionAnalytics />} />
  <Route path="/authority" element={<Authority />} />
  <Route path="/authority/alerts" element={<AuthorityAlerts />} />
  <Route path="/authority/alerts/:id" element={<AlertVerification />} />
  {/* New dashboard aliases for role-based redirect */}
  <Route path="/student-dashboard" element={<StudentDashboard />} />
  <Route path="/teacher-dashboard" element={<Teacher />} />
  <Route path="/parent-dashboard" element={<ParentDashboard />} />
  <Route path="/institution-dashboard" element={<InstitutionDashboard />} />
  <Route path="/authority-dashboard" element={<Authority />} />
  <Route path="/quiz" element={<StudentQuiz />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
