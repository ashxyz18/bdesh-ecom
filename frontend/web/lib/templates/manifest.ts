export interface TemplateManifest {
  id: string;
  name: string;
  description?: string;
  version?: string;
  css: string | string[];
  js?: string | string[];
  fonts?: string[];
  thumbnail?: string;
  previewUrl?: string;
  entryPoint: string;
  sections: Record<string, SectionMapping>;
  interactivity?: InteractivityConfig;
}

export interface SectionMapping {
  selector: string;
  type?: 'text' | 'attribute' | 'class' | 'products' | 'cart-count' | 'visibility' | 'style';
  attribute?: string;
  source?: string;
  template?: string;
  fallback?: string;
  cardTemplate?: string;
  visibility?: 'show' | 'hide';
}

export interface InteractivityConfig {
  cart?: {
    trigger?: string;
    drawer?: string;
    overlay?: string;
    itemCount?: string;
  };
  search?: {
    trigger?: string;
    overlay?: string;
    input?: string;
    results?: string;
  };
  mobileMenu?: {
    trigger?: string;
    menu?: string;
    overlay?: string;
    closeBtn?: string;
  };
  wishlist?: {
    selector?: string;
    activeClass?: string;
  };
  productCards?: {
    quickAdd?: string;
    wishlist?: string;
    productLink?: string;
  };
  newsletter?: {
    form?: string;
    input?: string;
    button?: string;
  };
}

export interface TemplateFileInfo {
  id: string;
  name: string;
  path: string;
  type: 'directory' | 'file';
  size?: number;
  extension?: string;
}

export interface TemplateUploadResult {
  success: boolean;
  templateId?: string;
  name?: string;
  error?: string;
  manifest?: TemplateManifest;
}

export interface DetectedSections {
  logo?: string;
  hero?: string;
  products?: string;
  footer?: string;
  nav?: string;
  cart?: string;
  search?: string;
  searchInput?: string;
}

export function createDefaultManifest(id: string, name: string, entryPoint: string, cssFiles: string[], jsFiles: string[]): TemplateManifest {
  return {
    id,
    name,
    version: '1.0.0',
    css: cssFiles,
    js: jsFiles,
    entryPoint,
    sections: {},
    interactivity: {
      cart: {
        trigger: '.header-icon[href="#cart"]',
        drawer: '.cart-drawer',
        overlay: '.cart-overlay',
      },
      search: {
        trigger: '.search-btn',
        overlay: '.search-overlay',
        input: '#searchInput',
      },
      mobileMenu: {
        trigger: '.menu-btn',
        menu: '.mobile-menu',
        overlay: '.menu-overlay',
        closeBtn: '.close-menu',
      },
      wishlist: {
        selector: '.wishlist-btn',
        activeClass: 'active',
      },
      productCards: {
        quickAdd: '.quick-add',
        wishlist: '.wishlist-btn',
        productLink: '.product-card',
      },
      newsletter: {
        form: '.newsletter-form',
        input: 'input[type="email"]',
        button: 'button[type="submit"]',
      },
    },
  };
}