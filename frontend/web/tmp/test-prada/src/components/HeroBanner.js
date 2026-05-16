import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function HeroBanner() {
  const { hero } = useTheme();

  if (!hero?.heroEnabled) {
    return null;
  }

  const textPositions = {
    'left': { alignItems: 'flex-start', textAlign: 'left', paddingLeft: '5%' },
    'center': { alignItems: 'center', textAlign: 'center' },
    'right': { alignItems: 'flex-end', textAlign: 'right', paddingRight: '5%' },
    'bottom-left': { alignItems: 'flex-start', textAlign: 'left', paddingLeft: '5%', justifyContent: 'flex-end', paddingBottom: '8%' },
    'bottom-right': { alignItems: 'flex-end', textAlign: 'right', paddingRight: '5%', justifyContent: 'flex-end', paddingBottom: '8%' },
  };

  const position = textPositions[hero.heroTextPosition] || textPositions.center;

  return (
    <section className="hero-banner">
      <div className="hero-image-container">
        {hero.heroImage ? (
          <img 
            src={hero.heroImage} 
            alt={hero.heroTitle} 
            className="hero-image desktop"
            loading="eager"
          />
        ) : (
          <div className="hero-placeholder desktop" />
        )}
        {hero.heroMobileImage ? (
          <img 
            src={hero.heroMobileImage} 
            alt={hero.heroTitle} 
            className="hero-image mobile"
            loading="eager"
          />
        ) : (
          <div className="hero-placeholder mobile" />
        )}
        <div 
          className="hero-overlay" 
          style={{ opacity: hero.heroOverlayOpacity || 0.2 }}
        />
      </div>
      
      <div className="hero-content" style={position}>
        <div className="hero-text-wrapper">
          <h2 
            className="hero-title"
            style={{ color: hero.heroTextColor || '#FFFFFF' }}
          >
            {hero.heroTitle}
          </h2>
          {hero.heroSubtitle && (
            <p 
              className="hero-subtitle"
              style={{ color: hero.heroTextColor || '#FFFFFF' }}
            >
              {hero.heroSubtitle}
            </p>
          )}
          {hero.heroCtaText && hero.heroCtaLink && (
            <Link 
              to={hero.heroCtaLink} 
              className="hero-cta"
              style={{ 
                color: hero.heroTextColor || '#FFFFFF',
                borderColor: hero.heroTextColor || '#FFFFFF'
              }}
            >
              {hero.heroCtaText}
            </Link>
          )}
        </div>
      </div>

      <style jsx>{`
        .hero-banner {
          position: relative;
          width: 100%;
          height: 85vh;
          min-height: 500px;
          max-height: 900px;
          overflow: hidden;
        }

        .hero-image-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-image.mobile {
          display: block;
        }

        .hero-image.desktop {
          display: none;
        }

        .hero-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%);
        }

        .hero-placeholder.desktop {
          display: none;
        }

        .hero-placeholder.mobile {
          display: block;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background-color: #000;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 100%;
          padding: 0 1.5rem;
        }

        .hero-text-wrapper {
          max-width: 600px;
        }

        .hero-title {
          font-size: clamp(2.5rem, 8vw, 5rem);
          font-weight: 400;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin-bottom: 1.25rem;
          text-transform: capitalize;
        }

        .hero-subtitle {
          font-size: clamp(0.9375rem, 2vw, 1.125rem);
          line-height: 1.6;
          margin-bottom: 2rem;
          max-width: 480px;
          opacity: 0.9;
        }

        .hero-cta {
          display: inline-block;
          padding: 1rem 2.5rem;
          border: 1.5px solid;
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-weight: 500;
          transition: all var(--transition-fast);
        }

        .hero-cta:hover {
          background-color: var(--color-secondary);
          color: var(--color-primary) !important;
          opacity: 1;
        }

        @media (min-width: 768px) {
          .hero-image.mobile,
          .hero-placeholder.mobile {
            display: none;
          }
          
          .hero-image.desktop,
          .hero-placeholder.desktop {
            display: block;
          }
        }
      `}</style>
    </section>
  );
}
