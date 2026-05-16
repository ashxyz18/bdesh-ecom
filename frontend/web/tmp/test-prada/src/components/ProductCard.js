import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function ProductCard({ product }) {
  const { productGrid } = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const attributes = product.attributes || {};
  const aspectRatio = productGrid?.productCardAspectRatio || '3/4';
  const showQuickAdd = productGrid?.showQuickAdd !== false;

  // Use custom attributes from bdesh.dashboard.json contract
  const isLimitedEdition = attributes.isLimitedEdition;
  const isNewArrival = attributes.isNewArrival;
  const badgeText = attributes.badgeText;
  const material = attributes.material;
  const collection = attributes.collection;

  const displayBadge = badgeText || (isNewArrival ? 'New' : isLimitedEdition ? 'Limited Edition' : null);

  // Get image - support both single image and array
  const images = product.images || [];
  const mainImage = images[0] || product.image || '';
  const hoverImage = images[1] || mainImage;

  return (
    <article 
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.id}`} className="product-link">
        <div className="product-image-wrapper" style={{ aspectRatio }}>
          {!imageLoaded && <div className="image-skeleton loading-skeleton" />}
          
          <img
            src={isHovered && hoverImage !== mainImage ? hoverImage : mainImage}
            alt={product.name}
            className={`product-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          {displayBadge && (
            <span 
              className="product-badge"
              style={{ 
                backgroundColor: isLimitedEdition ? 'var(--color-accent)' : 'var(--color-primary)',
                color: 'var(--color-secondary)'
              }}
            >
              {displayBadge}
            </span>
          )}

          {showQuickAdd && isHovered && product.variants?.length > 0 && (
            <div className="quick-add">
              <button className="quick-add-btn">Quick Add</button>
            </div>
          )}
        </div>

        <div className="product-info">
          {collection && (
            <span className="product-collection">{collection}</span>
          )}
          <h3 className="product-name">{product.name}</h3>
          {material && (
            <span className="product-material">{material}</span>
          )}
          <div className="product-price-row">
            <span className="product-price">
              {product.currency || '$'}{product.price?.toLocaleString()}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="product-compare-price">
                {product.currency || '$'}{product.compareAtPrice?.toLocaleString()}
              </span>
            )}
          </div>
          {attributes.isPersonalizable && (
            <span className="personalize-note">Personalizable</span>
          )}
        </div>
      </Link>

      <style jsx>{`
        .product-card {
          position: relative;
        }

        .product-link {
          display: block;
        }

        .product-link:hover {
          opacity: 1;
        }

        .product-image-wrapper {
          position: relative;
          overflow: hidden;
          background-color: #f8f8f8;
          margin-bottom: 0.875rem;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow), opacity 0.2s ease;
          opacity: 0;
        }

        .product-image.loaded {
          opacity: 1;
        }

        .product-card:hover .product-image.loaded {
          transform: scale(1.03);
        }

        .image-skeleton {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .product-badge {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          padding: 0.35rem 0.75rem;
          font-size: 0.6875rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
          z-index: 2;
        }

        .quick-add {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 0.75rem;
          background: linear-gradient(transparent, rgba(0,0,0,0.6));
          z-index: 2;
          animation: slideUp 0.2s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .quick-add-btn {
          width: 100%;
          padding: 0.75rem;
          background-color: var(--color-secondary);
          color: var(--color-primary);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: background-color var(--transition-fast);
        }

        .quick-add-btn:hover {
          background-color: var(--color-primary);
          color: var(--color-secondary);
        }

        .product-info {
          padding: 0 0.25rem;
        }

        .product-collection {
          display: block;
          font-size: 0.6875rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-muted);
          margin-bottom: 0.25rem;
        }

        .product-name {
          font-size: 0.875rem;
          font-weight: 400;
          line-height: 1.4;
          margin-bottom: 0.375rem;
          font-family: var(--font-body);
        }

        .product-material {
          display: block;
          font-size: 0.75rem;
          color: var(--color-muted);
          margin-bottom: 0.5rem;
        }

        .product-price-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .product-price {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .product-compare-price {
          font-size: 0.8125rem;
          color: var(--color-muted);
          text-decoration: line-through;
        }

        .personalize-note {
          display: block;
          font-size: 0.6875rem;
          color: var(--color-accent);
          margin-top: 0.375rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>
    </article>
  );
}
