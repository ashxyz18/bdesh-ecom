/* Re-exported main.js with modules and helpers */
(function() {
  'use strict';
  const KEY_CART = 'gng_cart';

  function getCart() { return JSON.parse(localStorage.getItem(KEY_CART)) || []; }
  function saveCart(cart) { localStorage.setItem(KEY_CART, JSON.stringify(cart)); updateCartCount(); }
  function updateCartCount() {
    const cart = getCart();
    const total = cart.reduce((a, b) => a + (b.qty || 1), 0);
    document.querySelectorAll('.cart-count').forEach(el => { el.textContent = total; el.style.display = total > 0 ? 'flex' : 'none'; });
  }

  window.addToCart = function(product) {
    if (!product.qty) product.qty = 1;
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id && item.variant === (product.variant || 'Default'));
    if (existing) { existing.qty += product.qty; } else { cart.push(product); }
    saveCart(cart);
    showToast(`${product.name} added to cart`);
  };

  window.showToast = function(msg) {
    let toast = document.getElementById('toast-notification');
    if (!toast) { toast = document.createElement('div'); toast.id = 'toast-notification'; toast.className = 'toast'; document.body.appendChild(toast); }
    toast.innerHTML = `<span>&#10003;</span> ${msg}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  // Slider
  let currentSlide = 0;
  function initSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dots button');
    if (!slides.length) return;
    function showSlide(idx) {
      currentSlide = idx;
      slides.forEach((s, i) => s.classList.toggle('active', i === idx));
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }
    document.querySelector('.hero-arrows .prev')?.addEventListener('click', () => showSlide((currentSlide - 1 + slides.length) % slides.length));
    document.querySelector('.hero-arrows .next')?.addEventListener('click', () => showSlide((currentSlide + 1) % slides.length));
    dots.forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));
    setInterval(() => showSlide((currentSlide + 1) % slides.length), 5000);
  }

  document.addEventListener('DOMContentLoaded', () => { initSlider(); updateCartCount(); });
})();
