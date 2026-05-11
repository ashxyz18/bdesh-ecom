// ==========================================================
// KOSKII - COMPLETE E-COMMERCE FUNCTIONALITY
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ==========================================================
    // STATE MANAGEMENT
    // ==========================================================
    const Store = {
        get(key) {
            try { return JSON.parse(localStorage.getItem(`koskii_${key}`)); }
            catch(e) { return null; }
        },
        set(key, value) {
            localStorage.setItem(`koskii_${key}`, JSON.stringify(value));
        }
    };

    const AppState = {
        cart: Store.get('cart') || [],
        wishlist: Store.get('wishlist') || [],
    };

    function saveState() {
        Store.set('cart', AppState.cart);
        Store.set('wishlist', AppState.wishlist);
    }

    // ==========================================================
    // PRODUCT DATA
    // ==========================================================
    const productsData = [
        { id: 'p1', name: 'Navy Blue Zariwork Soft Silk Designer Saree', category: 'Sarees', price: 1992, originalPrice: 2490, discount: 20, rating: 4.7, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii-navyblue-zariwork-softsilk-designer-saree-saus0040043_navy_blue_2_2.jpg?v=1767765016', colors: ['navy'], sizes: ['Free Size'] },
        { id: 'p2', name: 'Beige Chanderi Threadwork Salwar Suit', category: 'Salwar Suits', price: 2392, originalPrice: 2990, discount: 20, rating: 5.0, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/products/koskii-beige-printed-semi-crepe-designer-salwar-suit-ssss0021855_beige_1.jpg?v=1669197907', colors: ['beige'], sizes: ['S', 'M', 'L', 'XL'] },
        { id: 'p3', name: 'Black Georgette Threadwork Designer Saree', category: 'Sarees', price: 5192, originalPrice: 6490, discount: 20, rating: 4.8, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/SAUS0044237_BLACK_6.jpg?v=1752822324', colors: ['black'], sizes: ['Free Size'] },
        { id: 'p4', name: 'Sea Green Organza Zariwork Salwar Suit', category: 'Salwar Suits', price: 2622, originalPrice: 4370, discount: 40, rating: 4.7, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/SSRM0046196_SEA_GREEN_1.jpg?v=1758522681', colors: ['sea-green'], sizes: ['S', 'M', 'L'] },
        { id: 'p5', name: 'Mauve Swarovski Shimmer Designer Saree', category: 'Sarees', price: 4792, originalPrice: 5990, discount: 20, rating: 4.8, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/products/koskii-mauve-swarovski-shimmer-designer-saree-saus0018647_mauve_8.jpg?v=1748424803', colors: ['mauve'], sizes: ['Free Size'] },
        { id: 'p6', name: 'Wine Swarovski Semi Crepe Designer Saree', category: 'Sarees', price: 2392, originalPrice: 2990, discount: 20, rating: 4.6, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii-wine-swarovski-semi-crepe-designer-saree-saus0017312_wine_5_f298f650-e441-4941-a069-61bbb73382d9.jpg?v=1748424814', colors: ['wine'], sizes: ['Free Size'] },
        { id: 'p7', name: 'Navy Blue Stonework Georgette Saree', category: 'Sarees', price: 3992, originalPrice: 4990, discount: 20, rating: 4.5, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/SAUS0044175_NAVY_BLUE_4.jpg?v=1752819489', colors: ['navy'], sizes: ['Free Size'] },
        { id: 'p8', name: 'Navy Blue Swarovski Semi Crepe Saree', category: 'Sarees', price: 2392, originalPrice: 2990, discount: 20, rating: 4.8, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii-navy-blue-swarovski-semi-crepe-designer-saree-saus0017312_navy_blue_5_9263ce4e-8503-4580-b4e0-22ca59aaf743.jpg?v=1748424809', colors: ['navy'], sizes: ['Free Size'] },
        { id: 'p9', name: 'Sky Blue Organza Threadwork Salwar Suit', category: 'Salwar Suits', price: 2622, originalPrice: 4370, discount: 40, rating: 4.8, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/SSRM0043261_SKY_BLUE_10.jpg?v=1763020042', colors: ['sky-blue'], sizes: ['S', 'M', 'L', 'XL'] },
        { id: 'p10', name: 'Peacock Blue Stonework Satin Saree', category: 'Sarees', price: 7192, originalPrice: 8990, discount: 20, rating: 4.5, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii-peacockblue-swarovski-semicrepe-designer-saree-saus0029623_peacockblue_7_1c87310d-f16f-4de8-8a85-cae63c8d7636.jpg?v=1748424834', colors: ['peacock-blue'], sizes: ['Free Size'] },
        { id: 'p11', name: 'Beige Chanderi Threadwork Straight Suit', category: 'Salwar Suits', price: 2622, originalPrice: 4370, discount: 40, rating: 4.5, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/SSRM0046732_BEIGE_BROWN_1_44746f5f-9380-4382-bfcb-2d0cf7b55168.jpg?v=1764137859', colors: ['beige'], sizes: ['S', 'M', 'L'] },
        { id: 'p12', name: 'Turquoise Blue Stonework Satin Saree', category: 'Sarees', price: 3992, originalPrice: 4990, discount: 20, rating: 4.7, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii-turquoiseblue-stonework-satin-designer-saree-saus0032198_turquoise_blue_1_7.jpg?v=1747911009', colors: ['turquoise'], sizes: ['Free Size'] },
    ];

    // ==========================================================
    // NOTIFICATION
    // ==========================================================
    function showToast(title, message, type = 'default') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        const icons = { default: 'fa-check', success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<i class="fas ${icons[type] || icons.default}"></i><div class="toast-content"><h4>${title}</h4><p>${message}</p></div>`;
        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000);
    }

    // ==========================================================
    // NAVBAR
    // ==========================================================
    function initNavbar() {
        const header = document.querySelector('.main-header');
        if (!header) return;
        function update() { window.scrollY > 60 ? header.classList.add('scrolled') : header.classList.remove('scrolled'); }
        update();
        window.addEventListener('scroll', update, { passive: true });
    }

    // ==========================================================
    // MOBILE MENU
    // ==========================================================
    function initMobileMenu() {
        const btn = document.getElementById('menuBtn');
        const menu = document.getElementById('mobileMenu');
        const overlay = document.getElementById('menuOverlay');
        const close = document.getElementById('closeMenu');
        if (!btn || !menu || !overlay) return;
        function open() { menu.classList.add('active'); overlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
        function closeFn() { menu.classList.remove('active'); overlay.classList.remove('active'); document.body.style.overflow = ''; }
        btn.addEventListener('click', open);
        close?.addEventListener('click', closeFn);
        overlay.addEventListener('click', closeFn);
        document.addEventListener('keydown', e => e.key === 'Escape' && closeFn());
    }

    // ==========================================================
    // HERO SLIDER
    // ==========================================================
    function initHeroSlider() {
        const slides = document.querySelectorAll('.hero-slide');
        const dots = document.querySelectorAll('.hero-dots .dot');
        if (!slides.length) return;
        let current = 0, autoplay;
        function goTo(i) { slides[current].classList.remove('active'); dots[current]?.classList.remove('active'); current = ((i % slides.length) + slides.length) % slides.length; slides[current].classList.add('active'); dots[current]?.classList.add('active'); }
        dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); reset(); }));
        function start() { autoplay = setInterval(() => goTo(current + 1), 5000); }
        function reset() { clearInterval(autoplay); start(); }
        const slider = document.getElementById('heroSlider');
        let ts = 0;
        slider?.addEventListener('touchstart', e => { ts = e.changedTouches[0].screenX; }, { passive: true });
        slider?.addEventListener('touchend', e => { const d = ts - e.changedTouches[0].screenX; if (Math.abs(d) > 50) { goTo(d > 0 ? current + 1 : current - 1); reset(); } }, { passive: true });
        start();
    }

    // ==========================================================
    // SEARCH
    // ==========================================================
    function initSearch() {
        const btn = document.querySelector('.search-btn');
        const overlay = document.getElementById('searchOverlay');
        const closeBtn = document.getElementById('closeSearch');
        const input = document.getElementById('searchInput');
        if (!btn || !overlay) return;
        btn.addEventListener('click', () => { overlay.classList.add('active'); document.body.style.overflow = 'hidden'; setTimeout(() => input?.focus(), 100); });
        function close() { overlay.classList.remove('active'); document.body.style.overflow = ''; }
        closeBtn?.addEventListener('click', close);
        overlay.addEventListener('click', e => e.target === overlay && close());
        document.addEventListener('keydown', e => e.key === 'Escape' && close());
        if (input) {
            input.addEventListener('input', (e) => {
                const q = e.target.value.toLowerCase().trim();
                const grid = document.getElementById('searchResultsGrid');
                if (!grid) return;
                grid.innerHTML = '';
                if (!q) return;
                const filtered = productsData.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
                if (!filtered.length) { grid.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><h3>No results found</h3><p>Try a different search term</p></div>'; return; }
                filtered.forEach(p => {
                    const el = document.createElement('a'); el.className = 'search-result-item'; el.href = `product.html?id=${p.id}`;
                    el.innerHTML = `<img src="${p.image}" alt="${p.name}"><div class="result-info"><h4>${p.name}</h4><div class="result-price">₹${p.price.toLocaleString()}</div></div>`;
                    grid.appendChild(el);
                });
            });
        }
    }

    // ==========================================================
    // CART DRAWER
    // ==========================================================
    function initCart() {
        if (!document.querySelector('.cart-drawer')) {
            document.body.insertAdjacentHTML('beforeend', `
                <div class="cart-overlay" id="cartOverlay"></div>
                <div class="cart-drawer" id="cartDrawer">
                    <div class="cart-header">
                        <h2><i class="fas fa-shopping-bag"></i> Your Bag <span class="item-count">(0 items)</span></h2>
                        <button class="close-cart" id="closeCart"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="cart-items" id="cartItems">
                        <div class="cart-empty">
                            <i class="fas fa-shopping-bag"></i>
                            <h3>Your bag is empty</h3>
                            <p>Browse our collection and add items to your bag</p>
                            <a href="index.html" class="btn-continue">Continue Shopping</a>
                        </div>
                    </div>
                    <div class="cart-footer" id="cartFooter" style="display:none;">
                        <div class="cart-subtotal"><span>Subtotal</span><span id="cartSubtotal">₹0</span></div>
                        <div class="cart-shipping"><span>Shipping</span><span>Free</span></div>
                        <div class="cart-total"><span>Total</span><span id="cartTotal">₹0</span></div>
                        <button class="btn-checkout" id="checkoutBtn">Proceed to Checkout</button>
                    </div>
                </div>
            `);
        }

        const btn = document.querySelector('.header-icon[href="#cart"]');
        const drawer = document.getElementById('cartDrawer');
        const overlay = document.getElementById('cartOverlay');
        const closeBtn = document.getElementById('closeCart');

        function open() { overlay.classList.add('active'); drawer.classList.add('active'); document.body.style.overflow = 'hidden'; renderCart(); }
        function close() { overlay.classList.remove('active'); drawer.classList.remove('active'); document.body.style.overflow = ''; }
        btn?.addEventListener('click', (e) => { e.preventDefault(); open(); });
        closeBtn?.addEventListener('click', close);
        overlay?.addEventListener('click', close);
        document.addEventListener('keydown', e => e.key === 'Escape' && close());
        renderCart();
    }

    function renderCart() {
        const cartItems = document.getElementById('cartItems');
        const cartFooter = document.getElementById('cartFooter');
        if (!cartItems) return;
        if (!AppState.cart.length) {
            cartItems.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-bag"></i><h3>Your bag is empty</h3><p>Browse our collection and add items to your bag</p><a href="index.html" class="btn-continue">Continue Shopping</a></div>`;
            if (cartFooter) cartFooter.style.display = 'none';
            return;
        }
        let subtotal = 0;
        cartItems.innerHTML = '';
        AppState.cart.forEach(item => {
            const p = productsData.find(pr => pr.id === item.id) || productsData[0];
            subtotal += p.price * item.qty;
            const el = document.createElement('div'); el.className = 'cart-item';
            el.innerHTML = `<div class="cart-item-image"><img src="${p.image}" alt="${p.name}"></div><div class="cart-item-details"><h4>${p.name}</h4><div class="cart-variant">${item.size || ''}</div><div class="cart-price">₹${(p.price * item.qty).toLocaleString()}</div><div class="cart-item-actions"><div class="quantity-control"><button class="cart-qty-decrease" data-id="${item.id}">-</button><span>${item.qty}</span><button class="cart-qty-increase" data-id="${item.id}">+</button></div><button class="remove-item" data-id="${item.id}">Remove</button></div></div>`;
            cartItems.appendChild(el);
        });
        document.getElementById('cartSubtotal').textContent = `₹${subtotal.toLocaleString()}`;
        document.getElementById('cartTotal').textContent = `₹${subtotal.toLocaleString()}`;
        document.querySelector('.item-count').textContent = `(${AppState.cart.reduce((s, i) => s + i.qty, 0)} items)`;
        if (cartFooter) cartFooter.style.display = 'block';
        document.querySelectorAll('.remove-item').forEach(b => b.addEventListener('click', e => { e.preventDefault(); removeFromCart(e.target.dataset.id); }));
        document.querySelectorAll('.cart-qty-increase').forEach(b => b.addEventListener('click', e => { e.preventDefault(); updateCartQty(e.target.dataset.id, 1); }));
        document.querySelectorAll('.cart-qty-decrease').forEach(b => b.addEventListener('click', e => { e.preventDefault(); updateCartQty(e.target.dataset.id, -1); }));
    }

    function addToCart(pid, size, qty = 1) {
        const existing = AppState.cart.find(i => i.id === pid && i.size === size);
        if (existing) existing.qty += qty; else AppState.cart.push({ id: pid, size, qty });
        saveState(); updateCartBadge(); renderCart();
        showToast('Added to Bag', 'Item was added successfully', 'success');
    }

    function removeFromCart(pid) {
        AppState.cart = AppState.cart.filter(i => i.id !== pid);
        saveState(); updateCartBadge(); renderCart();
        showToast('Removed', 'Item removed from bag', 'default');
    }

    function updateCartQty(pid, delta) {
        const item = AppState.cart.find(i => i.id === pid);
        if (!item) return;
        item.qty += delta;
        if (item.qty <= 0) { removeFromCart(pid); return; }
        saveState(); updateCartBadge(); renderCart();
    }

    function updateCartBadge() {
        const total = AppState.cart.reduce((s, i) => s + i.qty, 0);
        document.querySelectorAll('.badge-count, .nav-badge').forEach(b => {
            b.textContent = total;
            total > 0 ? b.classList.add('visible') : b.classList.remove('visible');
        });
    }

    // ==========================================================
    // WISHLIST
    // ==========================================================
    function initWishlist() {
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            btn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); const i = this.querySelector('i'); const a = this.classList.contains('active'); if (a) { this.classList.remove('active'); i.classList.remove('fas'); i.classList.add('far'); showToast('Removed', 'Removed from wishlist', 'default'); } else { this.classList.add('active'); i.classList.remove('far'); i.classList.add('fas'); showToast('Added', 'Added to wishlist', 'success'); } this.style.transform = 'scale(1.3)'; setTimeout(() => this.style.transform = 'scale(1)', 200); });
        });
    }

    // ==========================================================
    // PRODUCT SLIDER DRAG
    // ==========================================================
    function initProductSlider() {
        const s = document.getElementById('productSlider');
        if (!s) return;
        let down = false, sx, sl;
        s.addEventListener('mousedown', e => { down = true; s.style.cursor = 'grabbing'; sx = e.pageX - s.offsetLeft; sl = s.scrollLeft; });
        s.addEventListener('mouseleave', () => { down = false; s.style.cursor = 'grab'; });
        s.addEventListener('mouseup', () => { down = false; s.style.cursor = 'grab'; });
        s.addEventListener('mousemove', e => { if (!down) return; e.preventDefault(); const x = e.pageX - s.offsetLeft; s.scrollLeft = sl - (x - sx) * 2; });
        s.style.cursor = 'grab';
        document.querySelectorAll('.quick-add').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); const id = b.dataset.productId; if (id) addToCart(id, 'Free Size'); }));
    }

    // ==========================================================
    // DYNAMIC PRODUCT RENDERING
    // ==========================================================
    function renderProducts() {
        const slider = document.getElementById('productSlider');
        if (!slider) return;
        slider.innerHTML = productsData.map(p => `<a href="product.html?id=${p.id}" class="product-card" data-product-id="${p.id}"><div class="product-image"><img src="${p.image}" alt="${p.name}">${p.badge ? `<span class="badge">${p.badge}</span>` : ''}<div class="rating">${p.rating}&#9733;</div><button class="wishlist-btn" data-id="${p.id}" onclick="event.preventDefault(); event.stopPropagation(); window.Koskii.showToast('Added','Added to wishlist','success');"><i class="far fa-heart"></i></button><button class="quick-add" data-product-id="${p.id}" onclick="event.preventDefault(); event.stopPropagation(); window.Koskii.addToCart('${p.id}', 'Free Size');">Quick Add</button></div><div class="product-info"><h3>${p.name}</h3><div class="price"><span class="sale-price">₹${p.price.toLocaleString()}</span>${p.originalPrice !== p.price ? `<span class="original-price">₹${p.originalPrice.toLocaleString()}</span>` : ''}${p.discount ? `<span class="discount">${p.discount}% OFF</span>` : ''}</div></div></a>`).join('');
    }

    // ==========================================================
    // SCROLL ANIMATIONS
    // ==========================================================
    function initScrollAnimations() {
        const observer = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }); }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
        document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in').forEach(el => observer.observe(el));
    }

    // ==========================================================
    // NEWSLETTER
    // ==========================================================
    function initNewsletter() {
        document.querySelectorAll('.newsletter-form').forEach(f => f.addEventListener('submit', function(e) { e.preventDefault(); const email = this.querySelector('input')?.value; if (email) { showToast('Subscribed!', 'Thank you for subscribing', 'success'); this.reset(); } }));
    }

    // ==========================================================
    // CHECKOUT
    // ==========================================================
    function initCheckout() {
        const btn = document.getElementById('checkoutBtn');
        if (btn) btn.addEventListener('click', () => showToast('Coming Soon', 'Checkout will be available shortly', 'info'));
    }

    // ==========================================================
    // INIT ALL
    // ==========================================================
    function initAll() {
        initNavbar();
        initMobileMenu();
        initHeroSlider();
        initSearch();
        initCart();
        initWishlist();
        initProductSlider();
        renderProducts();
        initScrollAnimations();
        initNewsletter();
        initCheckout();
        updateCartBadge();
        console.log('Koskii Clone - Fully Initialized');
    }

    initAll();

    // Expose
    window.Koskii = { state: AppState, addToCart, removeFromCart, showToast, products: productsData };
});
