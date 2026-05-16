import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const { footer } = useTheme();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const footerLinks = {
    company: [
      { label: 'About Us', url: '/about' },
      { label: 'Careers', url: '/careers' },
      { label: 'Sustainability', url: '/sustainability' },
      { label: 'Store Locator', url: '/stores' },
    ],
    legal: [
      { label: 'Privacy Policy', url: '/privacy' },
      { label: 'Terms & Conditions', url: '/terms' },
      { label: 'Cookie Policy', url: '/cookies' },
      { label: 'Legal Notice', url: '/legal' },
    ],
    support: [
      { label: 'Contact Us', url: '/contact' },
      { label: 'Shipping', url: '/shipping' },
      { label: 'Returns', url: '/returns' },
      { label: 'FAQ', url: '/faq' },
    ],
  };

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Newsletter */}
            <div className="footer-newsletter">
              <h3 className="footer-heading">{footer?.footerNewsletterTitle || 'Stay Connected'}</h3>
              <p className="footer-text">{footer?.footerNewsletterText || 'Subscribe to receive updates on new collections and exclusive offers.'}</p>
              
              <form onSubmit={handleSubmit} className="newsletter-form">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your e-mail address"
                  className="newsletter-input"
                  required
                />
                <button type="submit" className="newsletter-btn">
                  {subscribed ? 'Subscribed!' : 'Subscribe'}
                </button>
              </form>
            </div>

            {/* Links */}
            <div className="footer-links">
              <div className="footer-links-col">
                <h4 className="footer-subheading">Company</h4>
                <ul>
                  {footerLinks.company.map((link, index) => (
                    <li key={index}>
                      <Link to={link.url} className="footer-link">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="footer-links-col">
                <h4 className="footer-subheading">Support</h4>
                <ul>
                  {footerLinks.support.map((link, index) => (
                    <li key={index}>
                      <Link to={link.url} className="footer-link">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="footer-links-col">
                <h4 className="footer-subheading">Legal</h4>
                <ul>
                  {footerLinks.legal.map((link, index) => (
                    <li key={index}>
                      <Link to={link.url} className="footer-link">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="copyright">{footer?.footerCopyright || '\u00A9 2026 All Rights Reserved'}</p>
          
          {footer?.footerShowSocial !== false && (
            <div className="social-links">
              {['facebook', 'twitter', 'instagram', 'youtube', 'tiktok'].map((social) => (
                <a 
                  key={social} 
                  href={`https://${social}.com`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label={social}
                >
                  <SocialIcon name={social} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .site-footer {
          background-color: var(--color-primary);
          color: var(--color-secondary);
        }

        .footer-main {
          padding: var(--spacing-3xl) 0 var(--spacing-2xl);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--spacing-2xl);
        }

        .footer-heading {
          font-size: 1.5rem;
          font-weight: 400;
          margin-bottom: var(--spacing-md);
          letter-spacing: -0.02em;
        }

        .footer-text {
          font-size: 0.9375rem;
          line-height: 1.7;
          opacity: 0.7;
          margin-bottom: var(--spacing-lg);
          max-width: 400px;
        }

        .newsletter-form {
          display: flex;
          gap: 0.75rem;
          max-width: 400px;
        }

        .newsletter-input {
          flex: 1;
          padding: 0.875rem 1rem;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.3);
          color: var(--color-secondary);
          font-family: var(--font-body);
          font-size: 0.875rem;
          outline: none;
          transition: border-color var(--transition-fast);
        }

        .newsletter-input::placeholder {
          color: rgba(255,255,255,0.5);
        }

        .newsletter-input:focus {
          border-color: rgba(255,255,255,0.8);
        }

        .newsletter-btn {
          padding: 0.875rem 1.5rem;
          background-color: var(--color-secondary);
          color: var(--color-primary);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: opacity var(--transition-fast);
          white-space: nowrap;
        }

        .newsletter-btn:hover {
          opacity: 0.9;
        }

        .footer-links {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-lg);
        }

        .footer-subheading {
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 500;
          margin-bottom: var(--spacing-md);
          opacity: 0.9;
        }

        .footer-links-col ul {
          list-style: none;
        }

        .footer-links-col li {
          margin-bottom: 0.625rem;
        }

        .footer-link {
          font-size: 0.875rem;
          opacity: 0.6;
          transition: opacity var(--transition-fast);
        }

        .footer-link:hover {
          opacity: 1;
        }

        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: var(--spacing-md) 0;
        }

        .footer-bottom-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-md);
        }

        .copyright {
          font-size: 0.8125rem;
          opacity: 0.5;
        }

        .social-links {
          display: flex;
          gap: 1.25rem;
        }

        .social-link {
          opacity: 0.6;
          transition: opacity var(--transition-fast);
        }

        .social-link:hover {
          opacity: 1;
        }

        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }

          .footer-links {
            grid-template-columns: repeat(3, 1fr);
          }

          .footer-bottom-inner {
            flex-direction: row;
            justify-content: space-between;
          }
        }
      `}</style>
    </footer>
  );
}

function SocialIcon({ name }) {
  const icons = {
    facebook: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
    twitter: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
      </svg>
    ),
    instagram: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
    youtube: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="var(--color-primary)" />
      </svg>
    ),
    tiktok: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
  };

  return icons[name] || null;
}
