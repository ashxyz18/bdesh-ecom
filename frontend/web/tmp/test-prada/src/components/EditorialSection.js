import React from 'react';
import { Link } from 'react-router-dom';

const defaultEditorials = [
  {
    id: 'campaign-1',
    title: 'Days of Summer',
    subtitle: 'Campaign',
    description: 'Lightness and texture blend in a natural balance, capturing the energy of the summer season.',
    image: '',
    link: '/collection/summer-collection',
    cta: 'Discover',
    layout: 'full',
  },
  {
    id: 'sunglasses-1',
    title: 'Bold Reflections',
    subtitle: "Women's Sunglasses",
    description: 'New geometric shapes redefine contemporary eyewear.',
    image: '',
    link: '/collection/sunglasses',
    cta: 'Discover',
    layout: 'half',
  },
  {
    id: 'sunglasses-2',
    title: 'New Geometric Shapes',
    subtitle: "Men's Sunglasses",
    description: 'Architectural frames for the modern aesthetic.',
    image: '',
    link: '/collection/sunglasses',
    cta: 'Discover',
    layout: 'half',
  },
];

export default function EditorialSection({ editorials = defaultEditorials }) {
  const fullWidthItems = editorials.filter(e => e.layout === 'full');
  const halfWidthItems = editorials.filter(e => e.layout === 'half');

  return (
    <section className="editorial-section">
      <div className="container">
        <h2 className="section-title">Editorial</h2>
        
        {/* Full Width Editorials */}
        {fullWidthItems.map((item) => (
          <div key={item.id} className="editorial-full">
            <Link to={item.link} className="editorial-card full">
              <div className="editorial-media">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="editorial-image" loading="lazy" />
                ) : (
                  <div className="editorial-placeholder" />
                )}
                <div className="editorial-overlay" />
              </div>
              <div className="editorial-content">
                <span className="editorial-subtitle">{item.subtitle}</span>
                <h3 className="editorial-title">{item.title}</h3>
                <p className="editorial-desc">{item.description}</p>
                <span className="editorial-cta">{item.cta}</span>
              </div>
            </Link>
          </div>
        ))}

        {/* Half Width Grid */}
        {halfWidthItems.length > 0 && (
          <div className="editorial-grid">
            {halfWidthItems.map((item) => (
              <Link key={item.id} to={item.link} className="editorial-card half">
                <div className="editorial-media">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="editorial-image" loading="lazy" />
                  ) : (
                    <div className="editorial-placeholder" />
                  )}
                  <div className="editorial-overlay" />
                </div>
                <div className="editorial-content">
                  <span className="editorial-subtitle">{item.subtitle}</span>
                  <h3 className="editorial-title">{item.title}</h3>
                  <span className="editorial-cta">{item.cta}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .editorial-section {
          padding: var(--spacing-3xl) 0;
        }

        .section-title {
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 400;
          text-align: center;
          margin-bottom: var(--spacing-2xl);
          letter-spacing: -0.02em;
        }

        .editorial-full {
          margin-bottom: var(--spacing-lg);
        }

        .editorial-card {
          position: relative;
          display: block;
          overflow: hidden;
        }

        .editorial-card:hover {
          opacity: 1;
        }

        .editorial-card.full {
          aspect-ratio: 21/9;
          min-height: 400px;
        }

        .editorial-card.half {
          aspect-ratio: 4/5;
        }

        .editorial-media {
          position: absolute;
          inset: 0;
        }

        .editorial-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }

        .editorial-card:hover .editorial-image {
          transform: scale(1.03);
        }

        .editorial-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
        }

        .editorial-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(transparent 30%, rgba(0,0,0,0.7) 100%);
        }

        .editorial-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 2rem;
          color: #fff;
          z-index: 2;
        }

        .editorial-subtitle {
          display: block;
          font-size: 0.6875rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 0.75rem;
          opacity: 0.8;
        }

        .editorial-title {
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          font-weight: 400;
          letter-spacing: -0.02em;
          margin-bottom: 0.75rem;
        }

        .editorial-desc {
          font-size: 0.9375rem;
          line-height: 1.6;
          max-width: 500px;
          margin-bottom: 1.25rem;
          opacity: 0.85;
        }

        .editorial-cta {
          display: inline-block;
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 500;
          border-bottom: 1px solid rgba(255,255,255,0.5);
          padding-bottom: 0.25rem;
          transition: border-color var(--transition-fast);
        }

        .editorial-card:hover .editorial-cta {
          border-color: rgba(255,255,255,1);
        }

        .editorial-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--spacing-lg);
        }

        @media (min-width: 768px) {
          .editorial-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </section>
  );
}
