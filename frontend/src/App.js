import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<DoctorList />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/type" element={<SelectUserType />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/doctor" element={<DoctorRegister />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
