"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Store, Product } from "@/lib/templates/types";
import { useCart } from "@/lib/context/CartContext";
import { useToast } from "@/lib/context/ToastContext";
import { AlertCircle, Loader2 } from "lucide-react";

interface DynamicTemplateProps {
  templateId: string;
  store: Store;
  products: Product[];
}

interface TemplateData {
  id: string;
  name: string;
  html: string;
  cssFiles: string[];
  manifest: {
    sections?: Record<string, { selector: string; type?: string; source?: string; fallback?: string; template?: string }>;
    interactivity?: {
      cart?: { trigger?: string; drawer?: string; overlay?: string; itemCount?: string };
      search?: { trigger?: string; overlay?: string; input?: string; results?: string };
      mobileMenu?: { trigger?: string; menu?: string; overlay?: string; closeBtn?: string };
      wishlist?: { selector?: string; activeClass?: string };
      productCards?: { quickAdd?: string; wishlist?: string; productLink?: string };
      newsletter?: { form?: string; input?: string; button?: string };
    };
  };
}

export default function DynamicTemplate({ templateId, store, products }: DynamicTemplateProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addItem, count: cartCount } = useCart();
  const { showToast } = useToast();
  const cartCountRef = useRef(cartCount);
  cartCountRef.current = cartCount;

  // Fetch template metadata and HTML content
  useEffect(() => {
    if (!templateId) return;

    fetch(`/api/templates/${templateId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTemplateData(data.template);
        } else {
          setError(data.error || "Failed to load template");
        }
      })
      .catch(() => setError("Failed to load template"))
      .finally(() => setLoading(false));
  }, [templateId]);

  // Extract body content from HTML string
  const extractBodyContent = useCallback((html: string): string => {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      return bodyMatch[1];
    }
    // If no body tag, strip html/head tags and return the rest
    return html
      .replace(/<html[^>]*>/i, "")
      .replace(/<\/html>/i, "")
      .replace(/<head[^>]*>[\s\S]*?<\/head>/i, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<script[^>]*\/>/gi, "");
  }, []);

  // Strip inline scripts from HTML to prevent conflicts
  const stripScripts = (html: string): string => {
    return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<script\b[^>]*\/>/gi, "");
  };

  // Inject template CSS stylesheets
  useEffect(() => {
    if (!templateData?.cssFiles?.length) return;

    const linkElements: HTMLLinkElement[] = [];

    templateData.cssFiles.forEach((cssPath) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssPath;
      link.setAttribute("data-template-css", templateId);
      document.head.appendChild(link);
      linkElements.push(link);
    });

    return () => {
      linkElements.forEach((link) => {
        if (link.parentNode) link.parentNode.removeChild(link);
      });
    };
  }, [templateData?.cssFiles, templateId]);

  // After HTML is rendered, inject React interactivity into the DOM
  useEffect(() => {
    if (!contentRef.current || !templateData) return;

    const root = contentRef.current;
    const interactivity = templateData.manifest?.interactivity;
    const sections = templateData.manifest?.sections;
    const bodyContent = extractBodyContent(templateData.html);

    // Clear and set content
    root.innerHTML = stripScripts(bodyContent);

    // --- Store data bindings ---
    // Inject store name
    const nameElements = root.querySelectorAll(
      ".store-name, .brand-name, .site-title, [data-bind='store.name'], .logo span"
    );
    nameElements.forEach((el) => {
      if (el.textContent && el.textContent.includes(store.name)) return;
      el.textContent = store.name;
    });

    // Inject store logo
    if (store.logo) {
      const logoImages = root.querySelectorAll(
        ".logo img, [data-bind='store.logo'], .site-logo img, .brand img"
      );
      logoImages.forEach((el) => {
        (el as HTMLImageElement).src = store.logo!;
      });
    }

    // Update hero headline if sections contain it
    if (sections?.heroHeadline && store.settings?.heroHeadline) {
      const heroHeadlineEls = root.querySelectorAll(sections.heroHeadline.selector);
      heroHeadlineEls.forEach((el) => {
        el.textContent = store.settings!.heroHeadline || "";
      });
    }

    if (sections?.heroImage && store.settings?.heroImage) {
      const heroImgEls = root.querySelectorAll(sections.heroImage.selector);
      heroImgEls.forEach((el) => {
        (el as HTMLImageElement).src = store.settings!.heroImage || "";
      });
    }

    // Update footer copyright
    if (sections?.footerCopyright) {
      const footerEls = root.querySelectorAll(sections.footerCopyright.selector);
      footerEls.forEach((el) => {
        const template = sections.footerCopyright.template || "© {{year}} {{storeName}}";
        el.textContent = template
          .replace("{{year}}", String(new Date().getFullYear()))
          .replace("{{storeName}}", store.name);
      });
    }

    // --- Product injection ---
    const activeProducts = products.filter((p) => p.status === "active");
    const productGridSelectors = [
      ".product-grid",
      "#product-grid",
      ".products-grid",
      "[data-section='products']",
      ".product-slider",
      "#productSlider",
      ".products-container",
    ];

    if (activeProducts.length > 0) {
      let injected = false;

      for (const selector of productGridSelectors) {
        const container = root.querySelector(selector);
        if (container && container.children.length === 0) {
          container.innerHTML = activeProducts
            .slice(0, 12)
            .map((product) =>
              renderProductCard(product, store.id)
            )
            .join("");
          injected = true;
          break;
        }
      }

      // Also inject into sections-based selector
      if (!injected && sections?.products) {
        const sectionContainer = root.querySelector(sections.products.selector);
        if (sectionContainer && sectionContainer.children.length === 0) {
          sectionContainer.innerHTML = activeProducts
            .slice(0, 12)
            .map((product) =>
              renderProductCard(product, store.id)
            )
            .join("");
        }
      }
    }

    // --- Interactivity: attach React event handlers ---
    const cleanupFns: (() => void)[] = [];

    // Cart count badge
    const updateCartBadge = () => {
      const badgeSelectors = [
        ".cart-count",
        ".badge-count",
        ".nav-badge",
        interactivity?.cart?.itemCount,
      ].filter(Boolean);

      badgeSelectors.forEach((sel) => {
        if (!sel) return;
        root.querySelectorAll(sel).forEach((badge) => {
          if (cartCountRef.current > 0) {
            badge.textContent = String(cartCountRef.current);
            (badge as HTMLElement).style.display = "";
          } else {
            (badge as HTMLElement).style.display = "none";
          }
        });
      });
    };

    // Initial badge update
    updateCartBadge();

    // Cart triggers
    const cartTriggers = interactivity?.cart?.trigger
      ? root.querySelectorAll(interactivity.cart.trigger)
      : root.querySelectorAll(
          '.header-icon[href="#cart"], a[href*="cart"], [data-action="cart"]'
        );

    const handleCartClick = (e: Event) => {
      e.preventDefault();
      showToast("Cart", "View your cart items", "info");
    };

    cartTriggers.forEach((el) => {
      el.addEventListener("click", handleCartClick);
      cleanupFns.push(() => el.removeEventListener("click", handleCartClick));
    });

    // Search triggers
    const searchTriggers = interactivity?.search?.trigger
      ? root.querySelectorAll(interactivity.search.trigger)
      : root.querySelectorAll(".search-btn, [data-action='search']");

    const searchOverlay = interactivity?.search?.overlay
      ? root.querySelector(interactivity.search.overlay)
      : root.querySelector(".search-overlay");

    const searchInput = interactivity?.search?.input
      ? root.querySelector(interactivity.search.input)
      : root.querySelector("#searchInput, #search-input");

    const handleSearchClick = (e: Event) => {
      e.preventDefault();
      if (searchOverlay) {
        searchOverlay.classList.toggle("active");
      }
      if (searchInput && (searchInput as HTMLInputElement).focus) {
        setTimeout(() => (searchInput as HTMLInputElement).focus(), 100);
      }
    };

    searchTriggers.forEach((el) => {
      el.addEventListener("click", handleSearchClick);
      cleanupFns.push(() =>
        el.removeEventListener("click", handleSearchClick)
      );
    });

    // Close search on overlay click or Esc
    if (searchOverlay) {
      const closeSearch = (e: Event) => {
        if (e.target === searchOverlay) {
          searchOverlay.classList.remove("active");
        }
      };
      searchOverlay.addEventListener("click", closeSearch);
      cleanupFns.push(() =>
        searchOverlay.removeEventListener("click", closeSearch)
      );

      const closeSearchEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          searchOverlay.classList.remove("active");
        }
      };
      document.addEventListener("keydown", closeSearchEsc);
      cleanupFns.push(() =>
        document.removeEventListener("keydown", closeSearchEsc)
      );
    }

    // Search input live search
    if (searchInput && activeProducts.length > 0) {
      const handleSearchInput = () => {
        const query = ((searchInput as HTMLInputElement).value || "").toLowerCase();
        const resultsContainer =
          interactivity?.search?.results
            ? root.querySelector(interactivity.search.results)
            : root.querySelector("#searchResults, #searchResultsGrid");

        if (resultsContainer) {
          if (query.length > 0) {
            const filtered = activeProducts.filter(
              (p) =>
                p.name.toLowerCase().includes(query) ||
                (p.description || "").toLowerCase().includes(query)
            );
            resultsContainer.innerHTML = filtered
              .slice(0, 6)
              .map(
                (p) =>
                  `<a href="/store/${store.id}/products/${p.id}" class="search-result-item"><img src="${p.images[0] || "https://via.placeholder.com/200"}" alt="${p.name}"><div class="result-info"><h4>${p.name}</h4><div class="result-price">৳${p.price.toLocaleString()}</div></div></a>`
              )
              .join("");
          } else {
            resultsContainer.innerHTML = "";
          }
        }
      };

      searchInput.addEventListener("input", handleSearchInput);
      cleanupFns.push(() =>
        searchInput.removeEventListener("input", handleSearchInput)
      );
    }

    // Mobile menu
    const menuTriggers = interactivity?.mobileMenu?.trigger
      ? root.querySelectorAll(interactivity.mobileMenu.trigger)
      : root.querySelectorAll(".menu-btn, [data-action='menu']");

    const mobileMenu = interactivity?.mobileMenu?.menu
      ? root.querySelector(interactivity.mobileMenu.menu)
      : root.querySelector(".mobile-menu");

    const menuOverlay = interactivity?.mobileMenu?.overlay
      ? root.querySelector(interactivity.mobileMenu.overlay)
      : root.querySelector(".menu-overlay");

    const closeBtns = interactivity?.mobileMenu?.closeBtn
      ? root.querySelectorAll(interactivity.mobileMenu.closeBtn)
      : root.querySelectorAll(".close-menu");

    const openMenu = (e: Event) => {
      e.preventDefault();
      if (mobileMenu) mobileMenu.classList.add("active");
      if (menuOverlay) menuOverlay.classList.add("active");
    };

    const closeMenu = () => {
      if (mobileMenu) mobileMenu.classList.remove("active");
      if (menuOverlay) menuOverlay.classList.remove("active");
    };

    menuTriggers.forEach((el) => {
      el.addEventListener("click", openMenu);
      cleanupFns.push(() => el.removeEventListener("click", openMenu));
    });

    closeBtns.forEach((el) => {
      el.addEventListener("click", closeMenu);
      cleanupFns.push(() => el.removeEventListener("click", closeMenu));
    });

    if (menuOverlay) {
      menuOverlay.addEventListener("click", closeMenu);
      cleanupFns.push(() =>
        menuOverlay.removeEventListener("click", closeMenu)
      );
    }

    // Quick Add to Cart buttons
    const quickAddSelector = interactivity?.productCards?.quickAdd || ".quick-add";

    const handleQuickAdd = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      const btn = e.currentTarget as HTMLElement;
      const productCard = btn.closest(".product-card") as HTMLElement;
      const productId = productCard?.dataset?.productId;
      if (productId) {
        const product = products.find((p) => p.id === productId);
        if (product) {
          addItem({
            productId: product.id,
            price: product.price,
            name: product.name,
            image: product.images[0] || "https://via.placeholder.com/400",
          });
          showToast(
            "Added to Bag",
            `${product.name} added successfully`,
            "success"
          );
          updateCartBadge();
        }
      }
    };

    root.querySelectorAll(quickAddSelector).forEach((el) => {
      el.addEventListener("click", handleQuickAdd);
      cleanupFns.push(() =>
        el.removeEventListener("click", handleQuickAdd)
      );
    });

    // Wishlist buttons
    const wishlistSelector = interactivity?.wishlist?.selector || ".wishlist-btn";
    const wishlistActiveClass = interactivity?.wishlist?.activeClass || "active";

    const handleWishlistToggle = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      const btn = e.currentTarget as HTMLElement;
      const isActive = btn.classList.toggle(wishlistActiveClass);
      showToast(
        isActive ? "Added to wishlist" : "Removed from wishlist",
        "",
        "success"
      );
    };

    root.querySelectorAll(wishlistSelector).forEach((el) => {
      el.addEventListener("click", handleWishlistToggle);
      cleanupFns.push(() =>
        el.removeEventListener("click", handleWishlistToggle)
      );
    });

    // Newsletter form
    if (interactivity?.newsletter?.form) {
      const newsletterForm = root.querySelector(interactivity.newsletter.form);
      if (newsletterForm) {
        const handleNewsletterSubmit = (e: Event) => {
          e.preventDefault();
          showToast("Subscribed!", "Thank you for subscribing", "success");
        };
        newsletterForm.addEventListener("submit", handleNewsletterSubmit);
        cleanupFns.push(() =>
          newsletterForm.removeEventListener("submit", handleNewsletterSubmit)
        );
      }
    }

    // Hero slider auto-rotation
    const heroSlider = root.querySelector(".hero-slider");
    if (heroSlider) {
      const slides = heroSlider.querySelectorAll(".hero-slide");
      const dots = heroSlider.querySelectorAll(".hero-dots button");
      let currentSlide = 0;

      if (slides.length > 1) {
        const showSlide = (index: number) => {
          slides.forEach((s, i) => {
            (s as HTMLElement).classList.toggle("active", i === index);
          });
          dots.forEach((d, i) => {
            d.classList.toggle("active", i === index);
          });
        };

        const intervalId = setInterval(() => {
          currentSlide = (currentSlide + 1) % slides.length;
          showSlide(currentSlide);
        }, 5000);

        dots.forEach((dot, i) => {
          const clickHandler = () => {
            currentSlide = i;
            showSlide(i);
          };
          dot.addEventListener("click", clickHandler);
          cleanupFns.push(() =>
            dot.removeEventListener("click", clickHandler)
          );
        });

        cleanupFns.push(() => clearInterval(intervalId));
      }
    }

    // Header scroll effect
    const header = root.querySelector(".main-header, .header");
    if (header) {
      const handleScroll = () => {
        if (window.scrollY > 60) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      cleanupFns.push(() =>
        window.removeEventListener("scroll", handleScroll)
      );
    }

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateData, store, products, addItem, showToast, extractBodyContent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-16 bg-gray-100 animate-pulse" />
        <div className="h-[400px] bg-gray-200 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-lg h-[300px] animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !templateData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Template Not Found
          </h1>
          <p className="text-gray-500">
            {error || "The template could not be loaded."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dynamic-template-wrapper" ref={contentRef} />
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, `\u0026`)
    .replace(/</g, `\u003C`)
    .replace(/>/g, `\u003E`)
    .replace(/"/g, `\u0022`)
    .replace(/'/g, `\u0027`);
}

function renderProductCard(
  product: Product,
  storeId: string
): string {
  const image =
    product.images[0] || "https://via.placeholder.com/400";
  const safeName = escapeHtml(product.name);
  const comparePriceHtml = product.comparePrice
    ? `<span class="original-price">৳${product.comparePrice.toLocaleString()}</span>`
    : "";
  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(
          ((product.comparePrice - product.price) / product.comparePrice) *
            100
        )
      : 0;
  const discountHtml =
    discountPercent > 0
      ? `<span class="discount">${discountPercent}% OFF</span>`
      : "";

  return `
    <a href="/store/${storeId}/products/${product.id}" class="product-card" data-product-id="${product.id}">
      <div class="product-image">
        <img src="${image}" alt="${safeName}" loading="lazy">
        <span class="badge">New</span>
        <div class="rating">4.5&#9733;</div>
        <button class="wishlist-btn" data-product-id="${product.id}">
          <i class="far fa-heart">♡</i>
        </button>
        <button class="quick-add" data-product-id="${product.id}">
          Quick Add
        </button>
      </div>
      <div class="product-info">
        <h3>${safeName}</h3>
        <div class="price">
          <span class="sale-price">৳${product.price.toLocaleString()}</span>
          ${comparePriceHtml}
          ${discountHtml}
        </div>
      </div>
    </a>
  `.trim();
}