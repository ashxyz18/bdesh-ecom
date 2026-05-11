"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Store, Product } from '@/lib/templates/types';
import { useCart } from '@/lib/context/CartContext';
import { useToast } from '@/lib/context/ToastContext';

import '@/public/prebuilt-templates/koskii/css/style.css';

interface KoskiiTemplateProps {
  store: Store;
  products: Product[];
}

export default function KoskiiTemplate({ store, products }: KoskiiTemplateProps) {
  const { addItem, count: cartCount } = useCart();
  const { showToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const handleAddToCart = useCallback((product: Product, variantName?: string) => {
    addItem({
      productId: product.id,
      variantName,
      price: product.price,
      name: product.name,
      image: product.images[0] || 'https://via.placeholder.com/400',
    });
    showToast('Added to Bag', `${product.name} added successfully`, 'success');
  }, [addItem, showToast]);

  const handleQuickAdd = useCallback((productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      handleAddToCart(product, 'Free Size');
    }
  }, [products, handleAddToCart]);

  const announcementMessage = `Welcome to ${store.name}! Free shipping on orders over ৳2000!`;

  const heroSlides = [
    {
      image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii-ranipink-zariwork-puresilk-designer-saree-saus0035699_ranipink_1_1.jpg?v=1721373197',
      headline: store.settings?.heroHeadline || 'Silk Sarees at\nFlat 30% off',
      subtext: 'Be the next big thing',
    },
    {
      image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/GCBR0040728_BROWN_7.jpg?v=1738059747',
      headline: 'Flat 50% Off\nDesigner Lehengas',
      subtext: 'Dream big and build fast',
    },
    {
      image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/SSRM0043361_BLACK_5.jpg?v=1737975407',
      headline: 'Flat 40% Off\nSalwar Suits',
      subtext: 'Style meets comfort',
    },
  ];

  return (
    <div className="koskii-template">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </Head>
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <div className="scroll-text">{announcementMessage}</div>
      </div>

      {/* Search Overlay */}
      <div
        className={`search-overlay ${searchOpen ? 'active' : ''}`}
        id="searchOverlay"
        onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
      >
        <div className="search-container">
          <div className="search-input-wrapper">
            <i className="fas fa-search" />
            <input
              type="text"
              placeholder="Search sarees, suits, lehengas..."
              id="searchInput"
              ref={searchRef}
            />
            <button className="close-search" onClick={() => setSearchOpen(false)}>
              <i className="fas fa-times" />
            </button>
          </div>
          <div className="search-results" id="searchResults">
            <h3>Popular Searches</h3>
            <div className="search-results-grid" id="searchResultsGrid">
              {products.slice(0, 4).map((product) => (
                <a
                  key={product.id}
                  href={`/store/${store.id}/products/${product.id}`}
                  className="search-result-item"
                >
                  <img src={product.images[0]} alt={product.name} />
                  <div className="result-info">
                    <h4>{product.name}</h4>
                    <div className="result-price">৳{product.price.toLocaleString()}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className={`main-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-left">
          <button className="menu-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Menu">
            <i className="fas fa-bars" />
          </button>
          <button className="search-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
            <i className="fas fa-search" />
          </button>
        </div>
        <div className="logo">
          <Link href={`/store/${store.id}`}>
            {store.logo ? (
              <img src={store.logo} alt={store.name} />
            ) : (
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii_logo_left_right_white.0u84b2px.n_j~.png" alt={store.name} />
            )}
          </Link>
        </div>
        <div className="header-right">
          <Link href={`/store/${store.id}/account`} className="header-icon" aria-label="Account">
            <i className="far fa-user" />
          </Link>
          <Link href={`/store/${store.id}/wishlist`} className="header-icon" aria-label="Wishlist">
            <i className="far fa-heart" />
          </Link>
          <Link href={`/store/${store.id}/cart`} className="header-icon" aria-label="Bag">
            <i className="fas fa-shopping-bag" />
            {cartCount > 0 && <span className="badge-count visible">{cartCount}</span>}
          </Link>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`menu-overlay ${mobileMenuOpen ? 'active' : ''}`}
        id="menuOverlay"
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu */}
      <nav className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`} id="mobileMenu">
        <div className="menu-header">
          <button className="close-menu" onClick={() => setMobileMenuOpen(false)} aria-label="Close Menu">
            <i className="fas fa-times" />
          </button>
          <div className="menu-logo">
            <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii_logo_left_right_white.0u84b2px.n_j~.png" alt="Koskii" />
          </div>
        </div>
        <ul className="menu-list">
          <li><a href="#">SALE <i className="fas fa-chevron-right" /></a></li>
          <li><a href="#">SAREES <i className="fas fa-chevron-right" /></a></li>
          <li><a href="#">SALWAR SUITS <i className="fas fa-chevron-right" /></a></li>
          <li><a href="#">DRESS MATERIALS <i className="fas fa-chevron-right" /></a></li>
          <li><a href="#">LEHENGAS <i className="fas fa-chevron-right" /></a></li>
          <li><a href="#">GOWNS <i className="fas fa-chevron-right" /></a></li>
          <li><a href="#">BLOUSES <i className="fas fa-chevron-right" /></a></li>
          <li><a href="#">NEW ARRIVALS <i className="fas fa-chevron-right" /></a></li>
        </ul>
      </nav>

      {/* Hero Slider */}
      <section className="hero-section">
        <div className="hero-slider" id="heroSlider">
          {heroSlides.map((slide, index) => (
            <div key={index} className={`hero-slide ${index === heroIndex ? 'active' : ''}`}>
              <img src={slide.image} alt={slide.headline} />
              <div className="overlay" />
              <div className="hero-content">
                <h2 style={{ whiteSpace: 'pre-line' }}>{slide.headline}</h2>
                <a href="#" className="btn-shop">Shop Now</a>
              </div>
            </div>
          ))}
        </div>
        <div className="hero-dots">
          {heroSlides.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === heroIndex ? 'active' : ''}`}
              onClick={() => setHeroIndex(index)}
            />
          ))}
        </div>
      </section>

      {/* Category Icons */}
      <section className="category-icons">
        <div className="container">
          <div className="icon-grid">
            <a href="#" className="icon-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/01_5.jpg?v=1775455849" alt="SALE" />
              <span>SALE</span>
            </a>
            <a href="#" className="icon-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/02_5.jpg?v=1775455849" alt="SAREES" />
              <span>SAREES</span>
            </a>
            <a href="#" className="icon-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/03_5.jpg?v=1775455849" alt="SALWAR SUITS" />
              <span>SALWAR SUITS</span>
            </a>
            <a href="#" className="icon-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/04_5.jpg?v=1775455849" alt="DRESS MATERIALS" />
              <span>DRESS MATERIALS</span>
            </a>
            <a href="#" className="icon-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/05_5.jpg?v=1775455849" alt="LEHENGAS" />
              <span>LEHENGAS</span>
            </a>
            <a href="#" className="icon-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/06.jpg?v=1775455849" alt="GOWNS" />
              <span>GOWNS</span>
            </a>
          </div>
        </div>
      </section>

      {/* Summer Styles */}
      <section className="summer-styles">
        <div className="container">
          <h2 className="section-title fade-in">SUMMER STYLES</h2>
          <div className="collection-grid">
            <a href="#" className="collection-card fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Soft_Breezy.jpg?v=1775456841" alt="Soft & Breezy" />
            </a>
            <a href="#" className="collection-card fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Light_Bright_1.jpg?v=1775458443" alt="Light & Bright" />
            </a>
            <a href="#" className="collection-card fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Petals_Poses_1.jpg?v=1775458443" alt="Petals & Poses" />
            </a>
          </div>
        </div>
      </section>

      {/* Gift Section */}
      <section className="gift-section">
        <div className="container">
          <a href="#" className="gift-banner fade-in">
            <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Gift_Your_Mom_copy.jpg?v=1777530111" alt="Gift Your Mom" />
          </a>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="collections-grid">
        <div className="container">
          <div className="collections-row">
            <a href="#" className="collection-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/New_Arrivals_3.jpg?v=1775457483" alt="New Arrivals" />
            </a>
            <a href="#" className="collection-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Bestsellers_3.jpg?v=1775457483" alt="Bestsellers" />
            </a>
            <a href="#" className="collection-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Most_Loved.jpg?v=1775457483" alt="Most Loved" />
            </a>
            <a href="#" className="collection-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Trending_Now.jpg?v=1775457483" alt="Trending Now" />
            </a>
          </div>
        </div>
      </section>

      {/* Signature Suits */}
      <section className="signature-section">
        <div className="container">
          <a href="#" className="signature-banner fade-in">
            <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Signature_Suits_1.jpg?v=1777530110" alt="Signature Suits" />
          </a>
        </div>
      </section>

      {/* Wedding Series */}
      <section className="wedding-series">
        <div className="container">
          <h2 className="section-title fade-in">THE WEDDING SERIES</h2>
          <div className="wedding-grid">
            <a href="#" className="wedding-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Haldi_85bd6476-4bb9-4bc9-8ece-d5a7f7b906d3.jpg?v=1775457765" alt="Haldi" />
            </a>
            <a href="#" className="wedding-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Mehendi_ee201da0-0340-422c-a15b-bd29e05a760a.jpg?v=1775457765" alt="Mehendi" />
            </a>
            <a href="#" className="wedding-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Bridesmaid_3.jpg?v=1775457765" alt="Bridesmaid" />
            </a>
            <a href="#" className="wedding-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Sangeet_1f68ad36-174c-4d97-b237-057776041e21.jpg?v=1775457765" alt="Sangeet" />
            </a>
            <a href="#" className="wedding-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Reception_3.jpg?v=1775457765" alt="Reception" />
            </a>
            <a href="#" className="wedding-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Cocktail_897e836f-1e94-4450-9a7a-c59736ac492d.jpg?v=1775457765" alt="Cocktail" />
            </a>
          </div>
        </div>
      </section>

      {/* Silk Banner */}
      <section className="silk-banner">
        <div className="container">
          <a className="silk-banner-img fade-in">
            <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Pure_Silk_Sarees_9.jpg?v=1777530110" alt="Flat 30% Off Pure Silk Sarees" />
          </a>
        </div>
      </section>

      {/* Spotlight */}
      <section className="spotlight">
        <div className="container">
          <h2 className="section-title fade-in">IN THE SPOTLIGHT</h2>
          <div className="spotlight-grid">
            <a href="#" className="spotlight-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Zariwork_Saress.jpg?v=1775458695" alt="Zariwork Sarees" />
            </a>
            <a href="#" className="spotlight-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Anarkali_Suits_2.jpg?v=1775458695" alt="Anarkali Suits" />
            </a>
            <a href="#" className="spotlight-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Threadwork_Suits.jpg?v=1775458694" alt="Threadwork Suits" />
            </a>
            <a href="#" className="spotlight-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Stonework_Sarees_2.jpg?v=1775458695" alt="Stonework Sarees" />
            </a>
            <a href="#" className="spotlight-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Sharara_Suits_2.jpg?v=1775458694" alt="Sharara Suits" />
            </a>
            <a href="#" className="spotlight-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Tissue_Dress_Materials.jpg?v=1775458695" alt="Tissue Dress Materials" />
            </a>
          </div>
        </div>
      </section>

      {/* Bestsellers - Product Slider */}
      <section className="bestsellers">
        <div className="container">
          <h2 className="section-title fade-in">BESTSELLERS</h2>
          <div className="product-slider" id="productSlider">
            {products.length > 0 ? (
              products.filter((p) => p.status === 'active').map((product) => (
                <a
                  key={product.id}
                  href={`/store/${store.id}/products/${product.id}`}
                  className="product-card"
                  data-product-id={product.id}
                >
                  <div className="product-image">
                    <img src={product.images[0] || 'https://via.placeholder.com/400'} alt={product.name} />
                    <span className="badge">Bestseller</span>
                    <div className="rating">{(4 + Math.random()).toFixed(1)}&#9733;</div>
                    <button
                      className="wishlist-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        showToast('Added', 'Added to wishlist', 'success');
                      }}
                    >
                      <i className="far fa-heart" />
                    </button>
                    <button
                      className="quick-add"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleQuickAdd(product.id);
                      }}
                    >
                      Quick Add
                    </button>
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <div className="price">
                      <span className="sale-price">৳{product.price.toLocaleString()}</span>
                      {product.comparePrice && (
                        <span className="original-price">৳{product.comparePrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </a>
              ))
            ) : (
              // Demo products when no user products
              <>
                {[
                  { id: 'p1', name: 'Navy Blue Zariwork Soft Silk Designer Saree', price: 1992, comparePrice: 2490, image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii-navyblue-zariwork-softsilk-designer-saree-saus0040043_navy_blue_2_2.jpg?v=1767765016' },
                  { id: 'p2', name: 'Beige Chanderi Threadwork Salwar Suit', price: 2392, comparePrice: 2990, image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/products/koskii-beige-printed-semi-crepe-designer-salwar-suit-ssss0021855_beige_1.jpg?v=1669197907' },
                  { id: 'p3', name: 'Black Georgette Threadwork Designer Saree', price: 5192, comparePrice: 6490, image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/SAUS0044237_BLACK_6.jpg?v=1752822324' },
                  { id: 'p4', name: 'Sea Green Organza Zariwork Salwar Suit', price: 2622, comparePrice: 4370, image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/SSRM0046196_SEA_GREEN_1.jpg?v=1758522681' },
                  { id: 'p5', name: 'Mauve Swarovski Shimmer Designer Saree', price: 4792, comparePrice: 5990, image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/products/koskii-mauve-swarovski-shimmer-designer-saree-saus0018647_mauve_8.jpg?v=1748424803' },
                  { id: 'p6', name: 'Wine Swarovski Semi Crepe Designer Saree', price: 2392, comparePrice: 2990, image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii-wine-swarovski-semi-crepe-designer-saree-saus0017312_wine_5_f298f650-e441-4941-a069-61bbb73382d9.jpg?v=1748424814' },
                ].map((p) => (
                  <a key={p.id} href={`/store/${store.id}/products/${p.id}`} className="product-card">
                    <div className="product-image">
                      <img src={p.image} alt={p.name} />
                      <span className="badge">Bestseller</span>
                      <div className="rating">4.7&#9733;</div>
                      <button
                        className="wishlist-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          showToast('Added', 'Added to wishlist', 'success');
                        }}
                      >
                        <i className="far fa-heart" />
                      </button>
                      <button
                        className="quick-add"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          showToast('Added to Bag', 'Item added successfully', 'success');
                        }}
                      >
                        Quick Add
                      </button>
                    </div>
                    <div className="product-info">
                      <h3>{p.name}</h3>
                      <div className="price">
                        <span className="sale-price">৳{p.price.toLocaleString()}</span>
                        <span className="original-price">৳{p.comparePrice.toLocaleString()}</span>
                        <span className="discount">20% OFF</span>
                      </div>
                    </div>
                  </a>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Koskii Klan */}
      <section className="klan-section">
        <div className="container">
          <a href="#" className="klan-banner fade-in">
            <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Koskii_Klan_-_Half_Banner.jpg?v=1777876179" alt="Koskii Klan" />
          </a>
        </div>
      </section>

      {/* App Banner */}
      <section className="app-banner">
        <div className="container">
          <a href="#" className="app-banner-img fade-in">
            <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/App-Exclusive-APPFIRST-Banner.jpg?v=1772192943" alt="App Exclusive" />
          </a>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <h2 className="section-title fade-in">KOSKII CUSTOMER TESTIMONIALS</h2>
          <div className="testimonial-slider" id="testimonialSlider">
            <div className="testimonial-card">
              <div className="testimonial-img">
                <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Anshul_Sharma.png?v=1767336383" alt="Anshul Sharma" />
              </div>
              <div className="testimonial-content">
                <p>"The outfit was really good the fabric, fit, and overall look were comfortable and elegant. I loved wearing it"</p>
                <h4>Anshul Sharma</h4>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-img">
                <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Yashita-Trivedi_1.jpg?v=1750072014" alt="Yashita Trivedi" />
              </div>
              <div className="testimonial-content">
                <p>"I was looking for lightweight sarees with a glamorous touch for a summer wedding, and Koskii had the perfect collection."</p>
                <h4>Yashita Trivedi</h4>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-img">
                <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Mahima_Saraswat.png?v=1767336427" alt="Mahima Saraswat" />
              </div>
              <div className="testimonial-content">
                <p>"The fabric felt luxurious. The stonework was just right—not too much, not too loud. Wearing this saree was such a graceful experience."</p>
                <h4>Mahima Saraswat</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Category Icons */}
      <section className="bottom-categories">
        <div className="container">
          <div className="bottom-grid">
            <a href="#" className="bottom-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/All_Category_6.jpg?v=1777530137" alt="Upto 50% OFF" />
              <span>Upto 50% OFF</span>
            </a>
            <a href="#" className="bottom-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Sarees_1_1.jpg?v=1777530137" alt="Sarees on sale" />
              <span>Sarees on sale</span>
            </a>
            <a href="#" className="bottom-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/DM_1_1.jpg?v=1777530137" alt="Dress Materials" />
              <span>Dress Materials</span>
            </a>
            <a href="#" className="bottom-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/RM_9.jpg?v=1777530137" alt="Salwar suits" />
              <span>Salwar suits</span>
            </a>
            <a href="#" className="bottom-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/Pure_silk_sarees_11.jpg?v=1777530137" alt="Pure silk sarees" />
              <span>Pure silk sarees</span>
            </a>
            <a href="#" className="bottom-item fade-in">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/All_Category_01_1.jpg?v=1777353588" alt="Summer Nostalgia" />
              <span>Summer Nostalgia</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-top">
          <div className="container">
            <div className="footer-grid">
              <div className="footer-col">
                <h4>SHOP</h4>
                <ul>
                  <li><a href="#">Sarees</a></li>
                  <li><a href="#">Salwar Suits</a></li>
                  <li><a href="#">Lehengas</a></li>
                  <li><a href="#">Gowns</a></li>
                  <li><a href="#">Dress Materials</a></li>
                  <li><a href="#">Blouses</a></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>HELP</h4>
                <ul>
                  <li><a href="#">Contact Us</a></li>
                  <li><a href="#">Shipping & Delivery</a></li>
                  <li><a href="#">Returns & Exchanges</a></li>
                  <li><a href="#">Size Guide</a></li>
                  <li><a href="#">Track Order</a></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>ABOUT</h4>
                <ul>
                  <li><a href="#">About Us</a></li>
                  <li><a href="#">Careers</a></li>
                  <li><a href="#">Store Locator</a></li>
                  <li><a href="#">Blog</a></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>CONNECT</h4>
                <div className="social-links">
                  <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f" /></a>
                  <a href="#" aria-label="Instagram"><i className="fab fa-instagram" /></a>
                  <a href="#" aria-label="Pinterest"><i className="fab fa-pinterest-p" /></a>
                  <a href="#" aria-label="YouTube"><i className="fab fa-youtube" /></a>
                </div>
                <div className="newsletter">
                  <h5>Subscribe to our newsletter</h5>
                  <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); showToast('Subscribed!', 'Thank you for subscribing', 'success'); }}>
                    <input type="email" placeholder="Enter your email" required />
                    <button type="submit">Subscribe</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <div className="footer-logo">
              <img src="https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii_logo_White.0l-jq62h6nrb9.png" alt={store.name} />
            </div>
            <p className="copyright">© {new Date().getFullYear()} {store.name}. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* Sticky Bottom Navigation (Mobile) */}
      <nav className="sticky-nav">
        <a href={`/store/${store.id}`} className="sticky-item active">
          <i className="fas fa-home" />
          <span>Home</span>
        </a>
        <a href="#" className="sticky-item">
          <i className="fas fa-th-large" />
          <span>Categories</span>
        </a>
        <a href="#" className="sticky-item">
          <i className="fas fa-tag" />
          <span>Sale</span>
        </a>
        <a href={`/store/${store.id}/cart`} className="sticky-item">
          <i className="fas fa-shopping-bag" />
          <span>Bag</span>
          {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
        </a>
        <a href={`/store/${store.id}/account`} className="sticky-item">
          <i className="far fa-user" />
          <span>Account</span>
        </a>
      </nav>

      {/* Toast Container */}
      <div className="toast-container" />
    </div>
  );
}