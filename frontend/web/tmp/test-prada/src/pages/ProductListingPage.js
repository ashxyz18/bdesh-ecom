import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../api/client';
import { useTheme } from '../context/ThemeContext';

const sortOptions = [
  { value: 'createdAt_desc', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A-Z' },
];

export default function ProductListingPage() {
  const { slug } = useParams();
  const location = useLocation();
  const { productGrid } = useTheme();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const searchParams = new URLSearchParams(location.search);
  const collectionFilter = searchParams.get('collection');

  const loadProducts = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const params = {
        page: pageNum,
        limit: productGrid?.productsPerPage || 24,
        sort: sortBy,
        ...filters,
      };

      if (slug && slug !== 'all') {
        params.collection = slug;
      }
      if (collectionFilter) {
        params.collection = collectionFilter;
      }

      const response = await fetchProducts(params);
      const newProducts = Array.isArray(response) ? response : (response.products || []);
      const pagination = response.pagination || {};

      if (append) {
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }

      setHasMore(
        newProducts.length === (productGrid?.productsPerPage || 24) && 
        pageNum < (pagination.totalPages || 1)
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [slug, sortBy, filters, collectionFilter, productGrid]);

  useEffect(() => {
    setPage(1);
    loadProducts(1, false);
  }, [slug, sortBy, filters, collectionFilter, loadProducts]);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value,
    }));
    setPage(1);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadProducts(nextPage, true);
  };

  const pageTitle = slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'All Products';

  return (
    <main className="product-listing-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">{pageTitle}</h1>
          <p className="product-count">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <button 
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="16" y2="12" />
              <line x1="4" y1="18" x2="12" y2="18" />
            </svg>
            Filters
          </button>

          <div className="sort-control">
            <label htmlFor="sort">Sort by:</label>
            <select id="sort" value={sortBy} onChange={handleSortChange}>
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <h4>Gender</h4>
              <div className="filter-options">
                {['women', 'men', 'unisex'].map(gender => (
                  <label key={gender} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.gender === gender}
                      onChange={() => handleFilterChange('gender', filters.gender === gender ? '' : gender)}
                    />
                    <span>{gender.charAt(0).toUpperCase() + gender.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>Category</h4>
              <div className="filter-options">
                {['bags', 'ready-to-wear', 'shoes', 'accessories', 'sunglasses'].map(cat => (
                  <label key={cat} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.category === cat}
                      onChange={() => handleFilterChange('category', filters.category === cat ? '' : cat)}
                    />
                    <span>{cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              className="clear-filters"
              onClick={() => { setFilters({}); setShowFilters(false); }}
            >
              Clear All
            </button>
          </div>
        )}

        {/* Products Grid */}
        {loading && products.length === 0 ? (
          <div className="products-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="product-skeleton">
                <div className="skeleton-image loading-skeleton" />
                <div className="skeleton-text loading-skeleton" />
                <div className="skeleton-text short loading-skeleton" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="error-state">
            <p>Failed to load products. Please try again.</p>
            <button onClick={() => loadProducts(1, false)} className="retry-btn">Retry</button>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>No products found.</p>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {hasMore && (
              <div className="load-more">
                <button 
                  onClick={handleLoadMore} 
                  className="load-more-btn"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .product-listing-page {
          min-height: 100vh;
          padding: var(--spacing-xl) 0 var(--spacing-3xl);
        }

        .page-header {
          margin-bottom: var(--spacing-lg);
        }

        .page-title {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          font-weight: 400;
          letter-spacing: -0.02em;
          text-transform: capitalize;
          margin-bottom: 0.5rem;
        }

        .product-count {
          font-size: 0.875rem;
          color: var(--color-muted);
        }

        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md) 0;
          border-top: 1px solid rgba(0,0,0,0.08);
          border-bottom: 1px solid rgba(0,0,0,0.08);
          margin-bottom: var(--spacing-lg);
        }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem 0;
        }

        .sort-control {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .sort-control label {
          font-size: 0.875rem;
          color: var(--color-muted);
        }

        .sort-control select {
          font-family: var(--font-body);
          font-size: 0.875rem;
          border: none;
          background: none;
          cursor: pointer;
          padding-right: 1rem;
          outline: none;
        }

        .filters-panel {
          background-color: #f9f9f9;
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .filter-group {
          margin-bottom: var(--spacing-md);
        }

        .filter-group h4 {
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }

        .filter-options {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .filter-checkbox {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .filter-checkbox input {
          cursor: pointer;
        }

        .clear-filters {
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 500;
          border-bottom: 1px solid var(--color-primary);
          padding-bottom: 0.25rem;
          margin-top: var(--spacing-sm);
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
        }

        .skeleton-text {
          height: 1rem;
          width: 70%;
        }

        .skeleton-text.short {
          width: 40%;
        }

        .load-more {
          text-align: center;
          margin-top: var(--spacing-2xl);
        }

        .load-more-btn {
          padding: 1rem 3rem;
          border: 1.5px solid var(--color-primary);
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 500;
          background: none;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .load-more-btn:hover:not(:disabled) {
          background-color: var(--color-primary);
          color: var(--color-secondary);
        }

        .load-more-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-state,
        .empty-state {
          text-align: center;
          padding: var(--spacing-3xl) 0;
          color: var(--color-muted);
        }

        .retry-btn {
          margin-top: var(--spacing-md);
          padding: 0.75rem 2rem;
          background-color: var(--color-primary);
          color: var(--color-secondary);
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border: none;
          cursor: pointer;
        }

        @media (min-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem 1.5rem;
          }
        }

        @media (min-width: 1024px) {
          .products-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </main>
  );
}
