import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function AnnouncementBar() {
  const { announcementBar } = useTheme();

  if (!announcementBar?.announcementEnabled || !announcementBar?.announcementText) {
    return null;
  }

  const content = (
    <span className="announcement-text">{announcementBar.announcementText}</span>
  );

  return (
    <div className="announcement-bar">
      <div className="container">
        {announcementBar.announcementLink ? (
          <a href={announcementBar.announcementLink} className="announcement-link">
            {content}
          </a>
        ) : (
          content
        )}
      </div>
      <style jsx>{`
        .announcement-bar {
          background-color: var(--color-primary);
          color: var(--color-secondary);
          padding: 0.625rem var(--spacing-md);
          text-align: center;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-weight: 500;
        }
        .announcement-link {
          display: block;
        }
        .announcement-link:hover {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}
