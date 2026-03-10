import React from 'react';
import './Footer.css';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Facebook', icon: FacebookIcon, url: '#' },
    { name: 'Twitter', icon: TwitterIcon, url: '#' },
    { name: 'Instagram', icon: InstagramIcon, url: '#' },
    { name: 'LinkedIn', icon: LinkedInIcon, url: '#' },
    { name: 'YouTube', icon: YouTubeIcon, url: '#' },
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
          <p><EmailIcon sx={{ fontSize: 18, verticalAlign: 'middle', marginRight: 1 }} /> info@medicfamily.com</p>
          <p><PhoneIcon sx={{ fontSize: 18, verticalAlign: 'middle', marginRight: 1 }} /> +1 (555) 123-4567</p>
          <p><LocationOnIcon sx={{ fontSize: 18, verticalAlign: 'middle', marginRight: 1 }} /> Tu Ciudad, País</p>
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
