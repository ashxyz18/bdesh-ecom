import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>The page you are looking for does not exist or has been moved.</p>
          <Link to="/" className="home-link">Return to Home</Link>
        </div>
      </div>

      <style jsx>{`
        .not-found-page {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-3xl) 0;
        }

        .not-found-content {
          text-align: center;
        }

        .not-found-content h1 {
          font-size: clamp(4rem, 12vw, 8rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1;
          margin-bottom: var(--spacing-sm);
          opacity: 0.15;
        }

        .not-found-content h2 {
          font-size: clamp(1.25rem, 3vw, 1.75rem);
          font-weight: 400;
          margin-bottom: var(--spacing-sm);
        }

        .not-found-content p {
          color: var(--color-muted);
          margin-bottom: var(--spacing-xl);
        }

        .home-link {
          display: inline-block;
          padding: 1rem 2.5rem;
          background-color: var(--color-primary);
          color: var(--color-secondary);
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 500;
          transition: opacity var(--transition-fast);
        }

        .home-link:hover {
          opacity: 0.85;
        }
      `}</style>
    </main>
  );
}
