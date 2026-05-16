import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchConfig } from '../api/client';

const defaultConfig = {
  theme: {
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    accentColor: '#CC0000',
    mutedColor: '#666666',
    fontFamilyHeading: "'Helvetica Neue', Arial, sans-serif",
    fontFamilyBody: "'Helvetica Neue', Arial, sans-serif",
  },
  hero: {
    heroImage: '',
    heroMobileImage: '',
    heroTitle: 'Days of Summer',
    heroSubtitle: 'Lightness and texture blend in a natural balance, capturing the energy of the summer season.',
    heroCtaText: 'Discover',
    heroCtaLink: '/collection/summer-collection',
    heroTextPosition: 'center',
    heroTextColor: '#FFFFFF',
    heroOverlayOpacity: 0.2,
    heroEnabled: true,
  },
  announcementBar: {
    announcementText: 'Complimentary shipping on all orders',
    announcementLink: '',
    announcementEnabled: true,
  },
  navigation: {
    navLinks: [
      { label: 'Women', url: '/collection/women', children: [
        { label: 'New Arrivals', url: '/collection/new-drops' },
        { label: 'Bags', url: '/collection/women/bags' },
        { label: 'Ready to Wear', url: '/collection/women/ready-to-wear' },
        { label: 'Shoes', url: '/collection/women/shoes' },
        { label: 'Accessories', url: '/collection/women/accessories' },
      ]},
      { label: 'Men', url: '/collection/men', children: [
        { label: 'New Arrivals', url: '/collection/new-drops' },
        { label: 'Bags', url: '/collection/men/bags' },
        { label: 'Ready to Wear', url: '/collection/men/ready-to-wear' },
        { label: 'Shoes', url: '/collection/men/shoes' },
        { label: 'Accessories', url: '/collection/men/accessories' },
      ]},
      { label: 'Bags', url: '/collection/bags', children: [
        { label: 'Galleria', url: '/collection/galleria' },
        { label: 'Soft Bags', url: '/collection/soft-bags' },
        { label: 'Re-Edition', url: '/collection/re-edition' },
      ]},
      { label: 'Collections', url: '/collections', children: [
        { label: 'New Drops', url: '/collection/new-drops' },
        { label: 'Classics', url: '/collection/classics' },
        { label: 'Limited Edition', url: '/collection/limited-edition' },
        { label: 'Re-Nylon', url: '/collection/re-nylon' },
      ]},
      { label: 'Sunglasses', url: '/collection/sunglasses' },
      { label: 'Fragrances', url: '/collection/fragrances' },
    ],
  },
  footer: {
    footerNewsletterTitle: 'Stay Connected',
    footerNewsletterText: 'Subscribe to receive updates on new collections and exclusive offers.',
    footerShowSocial: true,
    footerCopyright: '\u00A9 2026 All Rights Reserved',
  },
  productGrid: {
    productsPerPage: 24,
    productCardAspectRatio: '3/4',
    showQuickAdd: true,
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await fetchConfig();
        setConfig(prev => ({
          ...prev,
          ...data,
          theme: { ...prev.theme, ...data.theme },
          hero: { ...prev.hero, ...data.hero },
          announcementBar: { ...prev.announcementBar, ...data.announcementBar },
          navigation: { ...prev.navigation, ...data.navigation },
          footer: { ...prev.footer, ...data.footer },
          productGrid: { ...prev.productGrid, ...data.productGrid },
        }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, []);

  const theme = config.theme;

  useEffect(() => {
    if (theme) {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', theme.primaryColor);
      root.style.setProperty('--color-secondary', theme.secondaryColor);
      root.style.setProperty('--color-accent', theme.accentColor);
      root.style.setProperty('--color-muted', theme.mutedColor);
      root.style.setProperty('--font-heading', theme.fontFamilyHeading);
      root.style.setProperty('--font-body', theme.fontFamilyBody);
    }
  }, [theme]);

  const value = {
    config,
    loading,
    error,
    theme,
    hero: config.hero,
    announcementBar: config.announcementBar,
    navigation: config.navigation,
    footer: config.footer,
    productGrid: config.productGrid,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
