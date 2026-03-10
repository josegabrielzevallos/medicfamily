import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import DoctorList from './pages/DoctorList';
import Appointments from './pages/Appointments';
import Login from './pages/Login';
import SelectUserType from './pages/SelectUserType';
import Register from './pages/Register';
import DoctorRegister from './pages/DoctorRegister';
import Admin from './pages/Admin';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientRegister from './pages/PatientRegister';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/doctor/dashboard';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<DoctorList />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/type" element={<SelectUserType />} />
          <Route path="/register/patient" element={<PatientRegister />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/doctor" element={<DoctorRegister />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        </Routes>
      </div>
      {!hideNavbar && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
