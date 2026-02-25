import React from 'react';
import './Footer.css';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Facebook', icon: FaFacebook, url: '#' },
    { name: 'Twitter', icon: FaTwitter, url: '#' },
    { name: 'Instagram', icon: FaInstagram, url: '#' },
    { name: 'LinkedIn', icon: FaLinkedin, url: '#' },
    { name: 'YouTube', icon: FaYoutube, url: '#' },
  ];

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Sección de información */}
        <div className="footer-section">
          <h3>MedicFamily</h3>
          <p>Tu plataforma de salud confiable para citas médicas y atención integral.</p>
        </div>

        {/* Sección de enlaces útiles */}
        <div className="footer-section">
          <h4>Enlaces Útiles</h4>
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/doctors">Médicos</a></li>
            <li><a href="/appointments">Citas</a></li>
            <li><a href="#">Contacto</a></li>
          </ul>
        </div>

        {/* Sección de contacto */}
        <div className="footer-section">
          <h4>Contacto</h4>
          <p>📧 info@medicfamily.com</p>
          <p>📞 +1 (555) 123-4567</p>
          <p>📍 Tu Ciudad, País</p>
        </div>

        {/* Sección de redes sociales */}
        <div className="footer-section">
          <h4>Síguenos</h4>
          <div className="social-links">
            {socialLinks.map((social) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  title={social.name}
                  className="social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconComponent className="social-icon" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Línea de copyright */}
      <div className="footer-bottom">
        <p>&copy; {currentYear} MedicFamily. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;
