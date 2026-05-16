import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const { navigation } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setActiveMegaMenu(null);
    setSearchOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = navigation?.navLinks || [];

  return (
    <header ref={headerRef} className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-main">
        <div className="container header-container">
          {/* Left - Menu Toggle */}
          <button 
            className="menu-toggle" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger">
              <span></span>
              <span></span>
              <span></span>
            </span>
            <span className="menu-label">Menu</span>
          </button>

          {/* Center - Logo */}
          <Link to="/" className="logo">
            <h1>LUXE</h1>
          </Link>

          {/* Right - Actions */}
          <div className="header-actions">
            <button 
              className="action-btn search-btn" 
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
            <Link to="/contact" className="action-btn" aria-label="Contact">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </Link>
            <Link to="/wishlist" className="action-btn" aria-label="Wishlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </Link>
            <Link to="/cart" className="action-btn cart-btn" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <div className="container">
            <ul className="nav-list">
              {navLinks.map((link, index) => (
                <li 
                  key={index} 
                  className="nav-item"
                  onMouseEnter={() => link.children?.length && setActiveMegaMenu(index)}
                  onMouseLeave={() => setActiveMegaMenu(null)}
                >
                  <Link to={link.url} className="nav-link">{link.label}</Link>
                  
                  {link.children?.length > 0 && activeMegaMenu === index && (
                    <div className="mega-menu">
                      <div className="container mega-menu-inner">
                        <div className="mega-menu-grid">
                          <div className="mega-menu-links">
                            <h3 className="mega-menu-title">{link.label}</h3>
                            <ul>
                              {link.children.map((child, childIndex) => (
                                <li key={childIndex}>
                                  <Link to={child.url} className="mega-menu-link">{child.label}</Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="mega-menu-featured">
                            <div className="featured-image">
                              <div className="placeholder-image" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <button className="close-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <nav className="mobile-nav">
          {navLinks.map((link, index) => (
            <div key={index} className="mobile-nav-section">
              <Link to={link.url} className="mobile-nav-link main">{link.label}</Link>
              {link.children?.length > 0 && (
                <ul className="mobile-subnav">
                  {link.children.map((child, childIndex) => (
                    <li key={childIndex}>
                      <Link to={child.url} className="mobile-nav-link sub">{child.label}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Search Overlay */}
      <div className={`search-overlay ${searchOpen ? 'open' : ''}`}>
        <div className="search-container">
          <button className="close-search" onClick={() => setSearchOpen(false)} aria-label="Close search">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <input 
            type="text" 
            placeholder="Search..." 
            className="search-input"
            autoFocus={searchOpen}
          />
        </div>
      </div>

      <style jsx>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background-color: var(--color-secondary);
          border-bottom: 1px solid transparent;
          transition: border-color var(--transition-base), box-shadow var(--transition-base);
        }
        
        .site-header.scrolled {
          border-bottom-color: rgba(0,0,0,0.08);
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }

        .header-main {
          position: relative;
        }

        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
        }

        .menu-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
        }

        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 5px;
          width: 20px;
        }

        .hamburger span {
          display: block;
          height: 1.5px;
          background-color: var(--color-primary);
          transition: all var(--transition-fast);
        }

        .menu-label {
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .logo h1 {
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
          transition: opacity var(--transition-fast);
        }

        .action-btn:hover {
          opacity: 0.6;
        }

        /* Desktop Nav */
        .desktop-nav {
          display: none;
          border-top: 1px solid rgba(0,0,0,0.06);
        }

        .nav-list {
          display: flex;
          justify-content: center;
          gap: 2.5rem;
          list-style: none;
          padding: 0.75rem 0;
        }

        .nav-item {
          position: relative;
        }

        .nav-link {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 500;
          padding: 0.5rem 0;
          display: block;
        }

        /* Mega Menu */
        .mega-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background-color: var(--color-secondary);
          border-top: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
          padding: 2.5rem 0;
          z-index: 100;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mega-menu-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
        }

        .mega-menu-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .mega-menu-links ul {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .mega-menu-link {
          font-size: 0.875rem;
          color: var(--color-muted);
          transition: color var(--transition-fast);
        }

        .mega-menu-link:hover {
          color: var(--color-primary);
          opacity: 1;
        }

        .featured-image {
          aspect-ratio: 4/3;
          background-color: #f5f5f5;
          overflow: hidden;
        }

        .placeholder-image {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
        }

        /* Mobile Menu */
        .mobile-menu {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background-color: var(--color-secondary);
          z-index: 1001;
          transform: translateX(-100%);
          transition: transform var(--transition-base);
          overflow-y: auto;
        }

        .mobile-menu.open {
          transform: translateX(0);
        }

        .mobile-menu-header {
          display: flex;
          justify-content: flex-end;
          padding: 1.25rem;
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }

        .close-btn {
          padding: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
        }

        .mobile-nav {
          padding: 1.5rem;
        }

        .mobile-nav-section {
          margin-bottom: 1.5rem;
        }

        .mobile-nav-link {
          display: block;
          padding: 0.625rem 0;
          font-size: 1.125rem;
        }

        .mobile-nav-link.main {
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 1.25rem;
        }

        .mobile-nav-link.sub {
          font-size: 0.9375rem;
          color: var(--color-muted);
          padding-left: 1rem;
        }

        .mobile-subnav {
          list-style: none;
          margin-top: 0.5rem;
        }

        /* Search Overlay */
        .search-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background-color: rgba(255,255,255,0.98);
          z-index: 1002;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 20vh;
          opacity: 0;
          visibility: hidden;
          transition: all var(--transition-base);
        }

        .search-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        .search-container {
          width: 100%;
          max-width: 600px;
          padding: 0 1.5rem;
          position: relative;
        }

        .close-search {
          position: absolute;
          top: -3rem;
          right: 1.5rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
        }

        .search-input {
          width: 100%;
          font-size: 2rem;
          font-family: var(--font-heading);
          border: none;
          border-bottom: 2px solid var(--color-primary);
          padding: 1rem 0;
          background: none;
          outline: none;
        }

        .search-input::placeholder {
          color: var(--color-muted);
        }

        /* Responsive */
        @media (min-width: 1024px) {
          .menu-toggle {
            display: none;
          }
          
          .desktop-nav {
            display: block;
          }
          
          .header-container {
            height: 70px;
          }
          
          .logo h1 {
            font-size: 2rem;
          }
        }

        @media (max-width: 1023px) {
          .header-actions .action-btn:not(.cart-btn):not(.search-btn) {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
