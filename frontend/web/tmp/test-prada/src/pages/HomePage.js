import React, { useEffect, useState } from 'react';
import HeroBanner from '../components/HeroBanner';
import CategoryGrid from '../components/CategoryGrid';
import CollectionShowcase from '../components/CollectionShowcase';
import EditorialSection from '../components/EditorialSection';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../api/client';

export default function HomePage() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadNewArrivals() {
      try {
        const response = await fetchProducts({ 
          limit: 8, 
          sort: 'createdAt_desc',
          collection: 'new-drops'
        });
        // Handle both array and object with products property
        const products = Array.isArray(response) ? response : (response.products || []);
        setNewArrivals(products);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadNewArrivals();
  }, []);

  return (
    <main className="home-page">
      <HeroBanner />
      
      <CategoryGrid />
      
      {/* New Arrivals */}
      <section className="new-arrivals-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">New Arrivals</h2>
            <a href="/collection/new-drops" className="section-link">View All</a>
          </div>
          
          {loading ? (
            <div className="products-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="product-skeleton">
                  <div className="skeleton-image loading-skeleton" />
                  <div className="skeleton-text loading-skeleton" />
                  <div className="skeleton-text short loading-skeleton" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="error-message">Failed to load products</div>
          ) : (
            <div className="products-grid">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <CollectionShowcase />
      
      <EditorialSection />

      <style jsx>{`
        .home-page {
          min-height: 100vh;
        }

        .new-arrivals-section {
          padding: var(--spacing-3xl) 0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: var(--spacing-xl);
        }

        .section-title {
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 400;
          letter-spacing: -0.02em;
        }

        .section-link {
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 500;
          border-bottom: 1px solid var(--color-primary);
          padding-bottom: 0.25rem;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem 1rem;
        }

        .product-skeleton {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .skeleton-image {
          aspect-ratio: 3/4;
          border-radius: 0;
        }

        .skeleton-text {
          height: 1rem;
          width: 70%;
          border-radius: 0;
        }

        .skeleton-text.short {
          width: 40%;
        }

        .error-message {
          text-align: center;
          padding: var(--spacing-xl);
          color: var(--color-muted);
        }

        @media (min-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 2rem 1.5rem;
          }
        }
      `}</style>
    </main>
  );
}
