import React from 'react';
import { Link } from 'react-router-dom';

const defaultCategories = [
  {
    title: "Women's Bags",
    subtitle: "New Arrivals",
    image: "",
    link: "/collection/women/bags",
  },
  {
    title: "Women's Ready to Wear",
    subtitle: "Spring Summer 2026",
    image: "",
    link: "/collection/women/ready-to-wear",
  },
  {
    title: "Women's Shoes",
    subtitle: "Sandals & Pumps",
    image: "",
    link: "/collection/women/shoes",
  },
  {
    title: "Women's Accessories",
    subtitle: "Sunglasses & Small Leather",
    image: "",
    link: "/collection/women/accessories",
  },
  {
    title: "Men's Bags",
    subtitle: "Messenger & Backpacks",
    image: "",
    link: "/collection/men/bags",
  },
  {
    title: "Men's Ready to Wear",
    subtitle: "Spring Summer 2026",
    image: "",
    link: "/collection/men/ready-to-wear",
  },
  {
    title: "Men's Shoes",
    subtitle: "Loafers & Sneakers",
    image: "",
    link: "/collection/men/shoes",
  },
  {
    title: "Men's Accessories",
    subtitle: "Belts & Sunglasses",
    image: "",
    link: "/collection/men/accessories",
  },
];

export default function CategoryGrid({ categories = defaultCategories, title = "Shop by Category" }) {
  return (
    <section className="category-grid-section">
      <div className="container">
        {title && <h2 className="section-title">{title}</h2>}
        
        <div className="category-grid">
          {categories.map((category, index) => (
            <Link 
              key={index} 
              to={category.link} 
              className="category-card"
            >
              <div className="category-image-wrapper">
                {category.image ? (
                  <img 
                    src={category.image} 
                    alt={category.title}
                    className="category-image"
                    loading="lazy"
                  />
                ) : (
                  <div className="category-placeholder" />
                )}
                <div className="category-overlay" />
              </div>
              <div className="category-text">
                <span className="category-subtitle">{category.subtitle}</span>
                <h3 className="category-title">{category.title}</h3>
                <span className="category-cta">Discover</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .category-grid-section {
          padding: var(--spacing-3xl) 0;
        }

        .section-title {
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 400;
          text-align: center;
          margin-bottom: var(--spacing-2xl);
          letter-spacing: -0.02em;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .category-card {
          position: relative;
          aspect-ratio: 3/4;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 1.25rem;
        }

        .category-card:hover {
          opacity: 1;
        }

        .category-image-wrapper {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .category-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }

        .category-card:hover .category-image {
          transform: scale(1.05);
        }

        .category-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #e8e8e8 0%, #d0d0d0 100%);
        }

        .category-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(transparent 40%, rgba(0,0,0,0.6) 100%);
        }

        .category-text {
          position: relative;
          z-index: 1;
          color: #fff;
        }

        .category-subtitle {
          display: block;
          font-size: 0.6875rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.375rem;
          opacity: 0.8;
        }

        .category-title {
          font-size: clamp(0.9375rem, 2vw, 1.25rem);
          font-weight: 500;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }

        .category-cta {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 500;
          border-bottom: 1px solid rgba(255,255,255,0.5);
          padding-bottom: 0.25rem;
          display: inline-block;
          transition: border-color var(--transition-fast);
        }

        .category-card:hover .category-cta {
          border-color: rgba(255,255,255,1);
        }

        @media (min-width: 768px) {
          .category-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
          }
          
          .category-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
}
