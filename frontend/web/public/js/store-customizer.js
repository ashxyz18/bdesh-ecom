// Store Customization Script
// This script applies user customizations on top of the base template

(function() {
  'use strict';

  // Get store ID from URL path
  function getStoreIdFromUrl() {
    const match = window.location.pathname.match(/\/store\/([^\/]+)/);
    return match ? match[1] : null;
  }

  // Apply customizations to the page
  function applyCustomizations(settings) {
    if (!settings) return;

    // Apply store name
    if (settings.name) {
      // Update announcement bar
      const announcementBar = document.querySelector('.announcement-bar .scroll-text, .announcement-bar');
      if (announcementBar) {
        announcementBar.textContent = `Welcome to ${settings.name}! Free shipping on orders over ৳2000!`;
      }

      // Update footer copyright
      const footerCopyright = document.querySelector('.main-footer .copyright, .main-footer p:last-child');
      if (footerCopyright) {
        footerCopyright.textContent = `© ${new Date().getFullYear()} ${settings.name}. All rights reserved.`;
      }

      // Update logo alt text and title
      const logoImg = document.querySelector('.logo img');
      if (logoImg) {
        logoImg.alt = settings.name;
        logoImg.title = settings.name;
      }
    }

    // Apply logo
    if (settings.logo) {
      const logoContainer = document.querySelector('.logo');
      if (logoContainer) {
        const existingImg = logoContainer.querySelector('img');
        if (existingImg) {
          existingImg.src = settings.logo;
          existingImg.alt = settings.name || 'Logo';
        } else {
          logoContainer.innerHTML = `<img src="${settings.logo}" alt="${settings.name || 'Store'}" style="height: 32px; width: auto;" />`;
        }
      }
    }

    // Apply hero settings
    if (settings.settings) {
      const heroSection = document.querySelector('.hero-section');

      if (heroSection && settings.settings.heroImage) {
        // Find and update hero image
        const heroImg = heroSection.querySelector('img.hero-slide.active img, .hero-slide.active img, .hero-section > img');
        if (heroImg) {
          heroImg.src = settings.settings.heroImage;
        }
      }

      // Update hero headline
      if (settings.settings.heroHeadline && settings.settings.heroHeadline !== 'Be the next big thing') {
        const heroHeadlines = document.querySelectorAll('.hero-content h2, .hero-content h1');
        heroHeadlines.forEach(h => {
          h.textContent = settings.settings.heroHeadline;
        });
      }

      // Update hero subtext
      if (settings.settings.heroSubtext && settings.settings.heroSubtext !== 'Dream big and build fast with BdeshShop') {
        const heroParagraphs = document.querySelectorAll('.hero-content p');
        heroParagraphs.forEach(p => {
          if (p.textContent && p.textContent.includes('BdeshShop')) {
            p.textContent = settings.settings.heroSubtext;
          }
        });
      }
    }

    // Apply theme colors
    if (settings.theme && settings.theme.primaryColor) {
      document.documentElement.style.setProperty('--accent-color', settings.theme.primaryColor);
      document.documentElement.style.setProperty('--primary', settings.theme.primaryColor);
    }

    console.log('Store customizations applied:', settings);
  }

  // Apply products to the page
  function applyProducts(products) {
    if (!products || products.length === 0) return;

    const productSlider = document.getElementById('productSlider');
    if (productSlider && products.length > 0) {
      // Generate product HTML
      const productHtml = products
        .filter(p => p.status === 'active')
        .map(p => `
          <a href="product.html?id=${p.id}" class="product-card" data-product-id="${p.id}">
            <div class="product-image">
              <img src="${p.images && p.images[0] ? p.images[0] : 'https://via.placeholder.com/400'}" alt="${p.name}">
              <span class="badge">Bestseller</span>
              <div class="rating">${(4 + Math.random()).toFixed(1)}&#9733;</div>
              <button class="wishlist-btn" onclick="event.preventDefault(); event.stopPropagation(); window.Koskii.showToast('Added','Added to wishlist','success');">
                <i class="far fa-heart"></i>
              </button>
              <button class="quick-add" onclick="event.preventDefault(); event.stopPropagation(); window.Koskii.addToCart('${p.id}', 'Free Size');">
                Quick Add
              </button>
            </div>
            <div class="product-info">
              <h3>${p.name}</h3>
              <div class="price">
                <span class="sale-price">৳${p.price.toLocaleString()}</span>
                ${p.comparePrice ? `<span class="original-price">৳${p.comparePrice.toLocaleString()}</span>` : ''}
              </div>
            </div>
          </a>
        `).join('');

      productSlider.innerHTML = productHtml;

      // Re-initialize product slider functionality
      if (window.Koskii && window.Koskii.initProductSlider) {
        window.Koskii.initProductSlider();
      }
    }
  }

  // Main initialization
  async function init() {
    const storeId = getStoreIdFromUrl();
    if (!storeId) {
      console.log('No store ID found in URL');
      return;
    }

    // Skip customization for preview stores
    if (storeId.startsWith('preview-')) {
      console.log('Using preview template');
      return;
    }

    try {
      // Fetch store settings
      const response = await fetch(`/api/stores/${storeId}/public`);
      if (!response.ok) {
        console.error('Failed to fetch store settings');
        return;
      }

      const data = await response.json();

      if (data.error) {
        console.error('Store error:', data.error);
        return;
      }

      // Apply customizations
      applyCustomizations(data);

      // Apply products if available
      if (data.products && data.products.length > 0) {
        applyProducts(data.products);
      }

    } catch (error) {
      console.error('Customization error:', error);
    }
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Small delay to ensure template's own scripts have run
    setTimeout(init, 100);
  }
})();