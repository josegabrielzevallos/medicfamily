import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MessageIcon from '@mui/icons-material/Message';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { doctorAPI } from '../api/client';
import './DoctorDashboard.css';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import DoctorCalendar from '../components/dashboard/DoctorCalendar';
import DoctorMessages from '../components/dashboard/DoctorMessages';
import PatientHistory from '../components/dashboard/PatientHistory';
import DoctorProfile from '../components/dashboard/DoctorProfile';
import DoctorAvailability from '../components/dashboard/DoctorAvailability';
import Reports from '../components/dashboard/Reports';
import Settings from '../components/dashboard/Settings';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [doctorData, setDoctorData] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    // Verificar si el usuario está autenticado y es médico
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'doctor') {
      navigate('/login');
      return;
    }

    // Si ya tiene name y specialty en localStorage (desde el login/registro), usarlos
    setDoctorData({
      ...user,
      name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Dr. Usuario',
    });

    // Adicionalmente, obtener el perfil completo desde la API
    doctorAPI.getMyProfile()
      .then(response => {
        const profile = response.data;
        setDoctorData({
          ...user,
          doctor_id: profile.id,
          name: profile.user?.first_name
            ? `${profile.user.first_name} ${profile.user.last_name}`.trim()
            : user.name || 'Dr. Usuario',
          specialty: profile.specialty?.name || user.specialty || 'Especialista',
          phone: profile.phone,
          address: profile.address,
          bio: profile.bio,
          is_verified: profile.is_verified,
          profile_image: profile.profile_image,
          consultation_fee: profile.consultation_fee,
        });
      })
      .catch(err => {
        console.warn('No se pudo cargar el perfil del doctor desde la API:', err);
      });
  }, [navigate]);

  const menuItems = [
    {
      id: 'overview',
      label: 'Inicio',
      icon: HomeIcon,
      description: 'Resumen general'
    },
    {
      id: 'calendar',
      label: 'Calendario',
      icon: CalendarMonthIcon,
      description: 'Agendar citas'
    },
    {
      id: 'messages',
      label: 'Mensajes',
      icon: MessageIcon,
      description: 'Comunicación',
      badge: unreadMessages > 0 ? unreadMessages : null
    },
    {
      id: 'patients',
      label: 'Pacientes',
      icon: PeopleIcon,
      description: 'Historial de pacientes'
    },
    {
      id: 'availability',
      label: 'Disponibilidad',
      icon: AccessTimeIcon,
      description: 'Horarios de trabajo'
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: BarChartIcon,
      description: 'Estadísticas'
    },
    {
      id: 'profile',
      label: 'Mi Perfil',
      icon: PersonIcon,
      description: 'Información personal'
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: SettingsIcon,
      description: 'Preferencias'
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview doctorData={doctorData} onNavigate={setActiveSection} />;
      case 'calendar':
        return <DoctorCalendar doctorData={doctorData} onNavigate={setActiveSection} />;
      case 'messages':
        return <DoctorMessages setUnreadMessages={setUnreadMessages} doctorData={doctorData} />;
      case 'patients':
        return <PatientHistory doctorData={doctorData} />;
      case 'availability':
        return <DoctorAvailability doctorData={doctorData} />;
      case 'reports':
        return <Reports doctorData={doctorData} />;
      case 'profile':
        return <DoctorProfile doctorData={doctorData} setDoctorData={setDoctorData} />;
      case 'settings':
        return <Settings doctorData={doctorData} />;
      default:
        return <DashboardOverview doctorData={doctorData} onNavigate={setActiveSection} />;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="doctor-dashboard">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="dashboard-logo-icon"><LocalHospitalIcon /></div>
            {sidebarOpen && <span className="logo-text">MedicFamily</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        <div className="sidebar-user">
          {sidebarOpen && (
            <>
              <div className="user-avatar"><PersonIcon sx={{ fontSize: 40 }} /></div>
              <div className="user-info">
                <p className="user-name">{doctorData?.name || 'Dr. Usuario'}</p>
                <p className="user-specialty">{doctorData?.specialty || 'Especialista'}</p>
              </div>
            </>
          )}
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
                title={item.label}
              >
                <span className="dashboard-menu-icon"><IconComponent /></span>
                {sidebarOpen && (
                  <>
                    <div className="menu-text">
                      <span className="menu-label">{item.label}</span>
                      <span className="menu-description">{item.description}</span>
                    </div>
                    {item.badge && <span className="menu-badge">{item.badge}</span>}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
            <span className="dashboard-logout-icon"><LogoutIcon /></span>
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <button
              className="mobile-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <MenuIcon />
            </button>
            <h1>{menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}</h1>
          </div>
          <div className="header-right">
            <div className="notification-bell">
              <NotificationsIcon />
              <span className="notification-count">3</span>
            </div>
            <div className="header-user">
              <span>{doctorData?.name || 'Dr. Usuario'}</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
