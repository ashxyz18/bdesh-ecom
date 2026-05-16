import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById } from '../api/client';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProductById(id);
        setProduct(data);
        if (data.variants?.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setAddingToCart(true);
    // Simulate cart addition - in real app, call addToCart API
    await new Promise(resolve => setTimeout(resolve, 500));
    setAddingToCart(false);
    alert('Added to cart!');
  };

  if (loading) {
    return (
      <main className="product-detail-page">
        <div className="container">
          <div className="product-detail-skeleton">
            <div className="skeleton-gallery loading-skeleton" />
            <div className="skeleton-info">
              <div className="skeleton-title loading-skeleton" />
              <div className="skeleton-price loading-skeleton" />
              <div className="skeleton-desc loading-skeleton" />
              <div className="skeleton-btn loading-skeleton" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="product-detail-page">
        <div className="container">
          <div className="error-state">
            <h2>Product Not Found</h2>
            <p>The product you are looking for does not exist.</p>
            <Link to="/" className="back-link">Back to Home</Link>
          </div>
        </div>
      </main>
    );
  }

  const attributes = product.attributes || {};
  const images = product.images || [product.image] || [];
  const variants = product.variants || [];

  // Use custom attributes from bdesh.dashboard.json contract
  const isLimitedEdition = attributes.isLimitedEdition;
  const material = attributes.material;
  const collection = attributes.collection;
  const campaign = attributes.campaign;
  const season = attributes.season;
  const sustainabilityNote = attributes.sustainabilityNote;
  const styleNumber = attributes.styleNumber;
  const madeIn = attributes.madeIn;
  const careInstructions = attributes.careInstructions;
  const dimensions = attributes.dimensions;
  const isPersonalizable = attributes.isPersonalizable;

  return (
    <main className="product-detail-page">
      <div className="container">
        {/* Breadcrumbs */}
        <nav className="breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          {collection && (
            <>
              <Link to={`/collection/${collection.toLowerCase().replace(/\s+/g, '-')}`}>{collection}</Link>
              <span>/</span>
            </>
          )}
          <span className="current">{product.name}</span>
        </nav>

        <div className="product-detail-grid">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="main-image-wrapper">
              {images[selectedImage] ? (
                <img 
                  src={images[selectedImage]} 
                  alt={product.name}
                  className="main-image"
                />
              ) : (
                <div className="main-image-placeholder" />
              )}
              
              {isLimitedEdition && (
                <span className="detail-badge limited">Limited Edition</span>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="thumbnail-strip">
                {images.map((img, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`${product.name} - ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            {collection && (
              <span className="product-collection-tag">{collection}</span>
            )}
            
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-price-row">
              <span className="product-price">
                {product.currency || '$'}{product.price?.toLocaleString()}
              </span>
              {product.compareAtPrice && (
                <span className="compare-price">
                  {product.currency || '$'}{product.compareAtPrice?.toLocaleString()}
                </span>
              )}
            </div>

            {material && (
              <p className="product-material">Material: {material}</p>
            )}

            {styleNumber && (
              <p className="product-style-number">Style: {styleNumber}</p>
            )}

            {/* Variant Selector */}
            {variants.length > 0 && (
              <div className="variant-selector">
                <label>Size / Variant</label>
                <div className="variant-options">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      className={`variant-btn ${selectedVariant?.id === variant.id ? 'active' : ''} ${variant.stock === 0 ? 'out-of-stock' : ''}`}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={variant.stock === 0}
                    >
                      {variant.title || variant.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="quantity-selector">
              <label>Quantity</label>
              <div className="quantity-control">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="cart-actions">
              <button 
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={addingToCart || !selectedVariant || selectedVariant.stock === 0}
              >
                {addingToCart ? 'Adding...' : selectedVariant?.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
              </button>
              
              <button className="wishlist-btn" aria-label="Add to wishlist">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            {isPersonalizable && (
              <div className="personalize-banner">
                <span>Personalization Available</span>
                <p>Add your initials or select charms to make it uniquely yours.</p>
              </div>
            )}

            {/* Product Details Accordion */}
            <div className="product-details">
              {product.description && (
                <details className="detail-group">
                  <summary>Description</summary>
                  <div className="detail-content">
                    <p>{product.description}</p>
                  </div>
                </details>
              )}
              
              {dimensions && (
                <details className="detail-group">
                  <summary>Dimensions</summary>
                  <div className="detail-content">
                    <p>{dimensions}</p>
                  </div>
                </details>
              )}

              {careInstructions && (
                <details className="detail-group">
                  <summary>Care Instructions</summary>
                  <div className="detail-content">
                    <p>{careInstructions}</p>
                  </div>
                </details>
              )}

              <details className="detail-group">
                <summary>Shipping & Returns</summary>
                <div className="detail-content">
                  <p>Complimentary shipping on all orders. Free returns within 30 days.</p>
                </div>
              </details>
            </div>

            {/* Metadata */}
            <div className="product-meta">
              {campaign && (
                <div className="meta-item">
                  <span className="meta-label">Campaign</span>
                  <span className="meta-value">{campaign}</span>
                </div>
              )}
              {season && (
                <div className="meta-item">
                  <span className="meta-label">Season</span>
                  <span className="meta-value">{season}</span>
                </div>
              )}
              {madeIn && (
                <div className="meta-item">
                  <span className="meta-label">Made In</span>
                  <span className="meta-value">{madeIn}</span>
                </div>
              )}
              {sustainabilityNote && (
                <div className="meta-item sustainability">
                  <span className="meta-label">Sustainability</span>
                  <span className="meta-value">{sustainabilityNote}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .product-detail-page {
          min-height: 100vh;
          padding: var(--spacing-lg) 0 var(--spacing-3xl);
        }

        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: var(--color-muted);
          margin-bottom: var(--spacing-lg);
        }

        .breadcrumbs a:hover {
          color: var(--color-primary);
        }

        .breadcrumbs .current {
          color: var(--color-primary);
        }

        .product-detail-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--spacing-xl);
        }

        /* Gallery */
        .product-gallery {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .main-image-wrapper {
          position: relative;
          aspect-ratio: 3/4;
          background-color: #f8f8f8;
          overflow: hidden;
        }

        .main-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .main-image-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
        }

        .detail-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          padding: 0.5rem 1rem;
          background-color: var(--color-accent);
          color: #fff;
          font-size: 0.6875rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
        }

        .thumbnail-strip {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .thumbnail {
          flex-shrink: 0;
          width: 70px;
          height: 90px;
          border: 1.5px solid transparent;
          background: none;
          cursor: pointer;
          padding: 0;
          overflow: hidden;
          transition: border-color var(--transition-fast);
        }

        .thumbnail.active {
          border-color: var(--color-primary);
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Product Info */
        .product-collection-tag {
          display: inline-block;
          font-size: 0.6875rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-muted);
          margin-bottom: 0.5rem;
        }

        .product-title {
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 400;
          letter-spacing: -0.02em;
          margin-bottom: var(--spacing-sm);
        }

        .product-price-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: var(--spacing-md);
        }

        .product-price {
          font-size: 1.125rem;
          font-weight: 500;
        }

        .compare-price {
          font-size: 1rem;
          color: var(--color-muted);
          text-decoration: line-through;
        }

        .product-material,
        .product-style-number {
          font-size: 0.875rem;
          color: var(--color-muted);
          margin-bottom: 0.5rem;
        }

        /* Variant Selector */
        .variant-selector {
          margin: var(--spacing-md) 0;
        }

        .variant-selector label {
          display: block;
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 500;
          margin-bottom: 0.75rem;
        }

        .variant-options {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .variant-btn {
          min-width: 48px;
          padding: 0.625rem 1rem;
          border: 1.5px solid rgba(0,0,0,0.15);
          background: none;
          font-size: 0.8125rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .variant-btn.active {
          border-color: var(--color-primary);
          background-color: var(--color-primary);
          color: var(--color-secondary);
        }

        .variant-btn.out-of-stock {
          opacity: 0.4;
          text-decoration: line-through;
          cursor: not-allowed;
        }

        /* Quantity */
        .quantity-selector {
          margin: var(--spacing-md) 0;
        }

        .quantity-selector label {
          display: block;
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 500;
          margin-bottom: 0.75rem;
        }

        .quantity-control {
          display: inline-flex;
          align-items: center;
          border: 1.5px solid rgba(0,0,0,0.15);
        }

        .quantity-control button {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.125rem;
          background: none;
          border: none;
          cursor: pointer;
        }

        .quantity-control button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .quantity-control span {
          width: 40px;
          text-align: center;
          font-size: 0.875rem;
          font-weight: 500;
        }

        /* Cart Actions */
        .cart-actions {
          display: flex;
          gap: var(--spacing-sm);
          margin: var(--spacing-lg) 0;
        }

        .add-to-cart-btn {
          flex: 1;
          padding: 1rem 2rem;
          background-color: var(--color-primary);
          color: var(--color-secondary);
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: opacity var(--transition-fast);
        }

        .add-to-cart-btn:hover:not(:disabled) {
          opacity: 0.85;
        }

        .add-to-cart-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .wishlist-btn {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid rgba(0,0,0,0.15);
          background: none;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .wishlist-btn:hover {
          border-color: var(--color-primary);
        }

        /* Personalize Banner */
        .personalize-banner {
          background-color: #f9f9f9;
          padding: var(--spacing-md);
          margin: var(--spacing-md) 0;
          border-left: 3px solid var(--color-accent);
        }

        .personalize-banner span {
          display: block;
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .personalize-banner p {
          font-size: 0.875rem;
          color: var(--color-muted);
          margin: 0;
        }

        /* Details Accordion */
        .product-details {
          margin: var(--spacing-lg) 0;
          border-top: 1px solid rgba(0,0,0,0.08);
        }

        .detail-group {
          border-bottom: 1px solid rgba(0,0,0,0.08);
        }

        .detail-group summary {
          padding: var(--spacing-md) 0;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 500;
          cursor: pointer;
          list-style: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-group summary::-webkit-details-marker {
          display: none;
        }

        .detail-group summary::after {
          content: '+';
          font-size: 1.25rem;
          font-weight: 300;
        }

        .detail-group[open] summary::after {
          content: '-';
        }

        .detail-content {
          padding-bottom: var(--spacing-md);
        }

        .detail-content p {
          font-size: 0.875rem;
          line-height: 1.7;
          color: var(--color-muted);
          margin: 0;
        }

        /* Product Meta */
        .product-meta {
          margin-top: var(--spacing-lg);
          padding-top: var(--spacing-lg);
          border-top: 1px solid rgba(0,0,0,0.08);
        }

        .meta-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          font-size: 0.8125rem;
        }

        .meta-label {
          color: var(--color-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .meta-value {
          font-weight: 500;
        }

        .meta-item.sustainability .meta-value {
          color: #2d7d46;
        }

        /* Skeleton */
        .product-detail-skeleton {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--spacing-xl);
        }

        .skeleton-gallery {
          aspect-ratio: 3/4;
        }

        .skeleton-info {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .skeleton-title {
          height: 2rem;
          width: 80%;
        }

        .skeleton-price {
          height: 1.5rem;
          width: 30%;
        }

        .skeleton-desc {
          height: 6rem;
          width: 100%;
        }

        .skeleton-btn {
          height: 3rem;
          width: 100%;
        }

        /* Error State */
        .error-state {
          text-align: center;
          padding: var(--spacing-3xl) 0;
        }

        .error-state h2 {
          margin-bottom: var(--spacing-sm);
        }

        .error-state p {
          color: var(--color-muted);
          margin-bottom: var(--spacing-lg);
        }

        .back-link {
          display: inline-block;
          padding: 0.75rem 2rem;
          background-color: var(--color-primary);
          color: var(--color-secondary);
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        @media (min-width: 768px) {
          .product-detail-grid,
          .product-detail-skeleton {
            grid-template-columns: 1fr 1fr;
            gap: var(--spacing-2xl);
          }
        }
      `}</style>
    </main>
  );
}
