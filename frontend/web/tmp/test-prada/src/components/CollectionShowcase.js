import React from 'react';
import { Link } from 'react-router-dom';

const defaultCollections = [
  {
    id: 'galleria',
    title: 'Galleria',
    subtitle: 'A signature icon, evolving through craftsmanship and contemporary vision.',
    image: '',
    link: '/collection/galleria',
    cta: 'Explore the Selection',
  },
  {
    id: 'soft-bags',
    title: 'Soft Bags',
    subtitle: 'Softness meets structure: iconic design, refined materials, and elevated functionality.',
    image: '',
    link: '/collection/soft-bags',
    cta: 'Explore the Selection',
  },
  {
    id: 'new-drops',
    title: 'New Drops',
    subtitle: 'The latest arrivals defining the season.',
    image: '',
    link: '/collection/new-drops',
    cta: 'Shop New Arrivals',
  },
];

export default function CollectionShowcase({ collections = defaultCollections }) {
  return (
    <section className="collection-showcase">
      <div className="container">
        <h2 className="section-title">Collections</h2>
        
        <div className="collections-list">
          {collections.map((collection, index) => (
            <div 
              key={collection.id || index} 
              className={`collection-item ${index % 2 === 1 ? 'reversed' : ''}`}
            >
              <div className="collection-media">
                {collection.image ? (
                  <img 
                    src={collection.image} 
                    alt={collection.title}
                    className="collection-image"
                    loading="lazy"
                  />
                ) : (
                  <div className="collection-placeholder" />
                )}
              </div>
              
              <div className="collection-content">
                <div className="collection-text">
                  <h3 className="collection-name">{collection.title}</h3>
                  <p className="collection-description">{collection.subtitle}</p>
                  <Link to={collection.link} className="collection-cta">
                    {collection.cta || 'Discover'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .collection-showcase {
          padding: var(--spacing-3xl) 0;
          background-color: var(--color-secondary);
        }

        .section-title {
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 400;
          text-align: center;
          margin-bottom: var(--spacing-2xl);
          letter-spacing: -0.02em;
        }

        .collections-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-3xl);
        }

        .collection-item {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--spacing-lg);
        }

        .collection-media {
          position: relative;
          aspect-ratio: 4/3;
          overflow: hidden;
        }

        .collection-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }

        .collection-item:hover .collection-image {
          transform: scale(1.02);
        }

        .collection-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
        }

        .collection-content {
          display: flex;
          align-items: center;
          padding: var(--spacing-md) 0;
        }

        .collection-text {
          max-width: 480px;
        }

        .collection-name {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          font-weight: 400;
          letter-spacing: -0.02em;
          margin-bottom: 1rem;
        }

        .collection-description {
          font-size: 1rem;
          line-height: 1.7;
          color: var(--color-muted);
          margin-bottom: 1.5rem;
        }

        .collection-cta {
          display: inline-block;
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 500;
          border-bottom: 1.5px solid var(--color-primary);
          padding-bottom: 0.375rem;
          transition: all var(--transition-fast);
        }

        .collection-cta:hover {
          opacity: 1;
          padding-bottom: 0.5rem;
        }

        @media (min-width: 768px) {
          .collection-item {
            grid-template-columns: 1fr 1fr;
            gap: var(--spacing-2xl);
            align-items: center;
          }

          .collection-item.reversed .collection-media {
            order: 2;
          }

          .collection-item.reversed .collection-content {
            order: 1;
            justify-content: flex-end;
            text-align: right;
          }

          .collection-media {
            aspect-ratio: 16/10;
          }
        }
      `}</style>
    </section>
  );
}
