import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import './Header.css';

const Header = ({ onBooking }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        <Link to="/" className="logo">
          <img src={logoImg} alt="AFRO Men's Beauty Salon Logo" className="logo-img" />
          <span className="logo-text">Afro Mens Beauty Salon</span>
        </Link>

        <nav className="nav-menu">
          <button type="button" className="nav-link" onClick={() => scrollToSection('services')}>
            SERVICES
          </button>
          <button type="button" className="nav-link" onClick={() => scrollToSection('about')}>
            ABOUT
          </button>
          <button type="button" className="nav-link" onClick={() => scrollToSection('reviews')}>
            REVIEWS
          </button>
          <Link to="/contact" className="nav-link">
            CONTACT
          </Link>
        </nav>

        <button className="book-btn" onClick={onBooking ? onBooking : () => navigate('/?book=true')}>
          BOOK NOW
        </button>
      </div>
    </header>
  );
};

export default Header;
