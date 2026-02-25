import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [doctorData, setDoctorData] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    // Verificar si el usuario está autenticado y es médico
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'doctor') {
      navigate('/login');
    }
    setDoctorData(user);
  }, [navigate]);

  const menuItems = [
    {
      id: 'overview',
      label: 'Inicio',
      icon: '🏠',
      description: 'Resumen general'
    },
    {
      id: 'calendar',
      label: 'Calendario',
      icon: '📅',
      description: 'Agendar citas'
    },
    {
      id: 'messages',
      label: 'Mensajes',
      icon: '💬',
      description: 'Comunicación',
      badge: unreadMessages > 0 ? unreadMessages : null
    },
    {
      id: 'patients',
      label: 'Pacientes',
      icon: '👥',
      description: 'Historial de pacientes'
    },
    {
      id: 'availability',
      label: 'Disponibilidad',
      icon: '⏰',
      description: 'Horarios de trabajo'
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: '📊',
      description: 'Estadísticas'
    },
    {
      id: 'profile',
      label: 'Mi Perfil',
      icon: '👨‍⚕️',
      description: 'Información personal'
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: '⚙️',
      description: 'Preferencias'
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview doctorData={doctorData} />;
      case 'calendar':
        return <DoctorCalendar />;
      case 'messages':
        return <DoctorMessages setUnreadMessages={setUnreadMessages} />;
      case 'patients':
        return <PatientHistory />;
      case 'availability':
        return <DoctorAvailability />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <DoctorProfile doctorData={doctorData} />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardOverview doctorData={doctorData} />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="doctor-dashboard">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🏥</span>
            {sidebarOpen && <span className="logo-text">MedicFamily</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
        </div>

        <div className="sidebar-user">
          {sidebarOpen && (
            <>
              <div className="user-avatar">👨‍⚕️</div>
              <div className="user-info">
                <p className="user-name">{doctorData?.name || 'Dr. Usuario'}</p>
                <p className="user-specialty">{doctorData?.specialty || 'Especialista'}</p>
              </div>
            </>
          )}
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
              title={item.label}
            >
              <span className="menu-icon">{item.icon}</span>
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
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
            <span className="logout-icon">🚪</span>
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
              ☰
            </button>
            <h1>{menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}</h1>
          </div>
          <div className="header-right">
            <div className="notification-bell">
              <span>🔔</span>
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
