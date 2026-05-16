export interface TemplateManifest {
  id: string;
  name: string;
  description?: string;
  version?: string;
  type?: 'react' | 'static' | 'next' | 'html';
  css: string | string[];
  js?: string | string[];
  fonts?: string[];
  thumbnail?: string;
  previewUrl?: string;
  entryPoint: string;
  sections: Record<string, SectionMapping>;
  interactivity?: InteractivityConfig;
  api?: {
    mappings?: Record<string, Record<string, string>>;
  };
  configSchema?: Record<string, ConfigSection>;
  defaultSettings?: Record<string, unknown>;
  defaultTheme?: Record<string, unknown>;
  dashboard?: DashboardConfig;
}

export interface ConfigField {
  type: 'text' | 'textarea' | 'image' | 'color' | 'number' | 'boolean' | 'select';
  label: string;
  default?: string | number | boolean;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
}

export interface ConfigSection {
  label: string;
  description?: string;
  fields: Record<string, ConfigField>;
}

export interface DashboardRequirement {
  id: string;
  label: string;
  description?: string;
  href: string;
  type?: 'products' | 'branding' | 'theme' | 'settings' | 'orders' | 'couriers' | 'content';
  required?: boolean;
}

export interface DashboardQuickAction {
  label: string;
  href: string;
  icon?: 'product' | 'settings' | 'store' | 'template' | 'orders' | 'couriers';
}

export interface DashboardCatalogConfig {
  label?: string;
  itemLabel?: string;
  collections?: DashboardCatalogCollection[];
  filters?: DashboardCatalogFilter[];
  productFields?: DashboardProductField[];
}

export interface DashboardCatalogCollection {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
}

export interface DashboardCatalogFilter {
  id: string;
  label: string;
  options: string[];
  required?: boolean;
}

export interface DashboardProductField {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'select' | 'boolean' | 'color' | 'image';
  required?: boolean;
  options?: string[];
}

export interface DashboardPageConfig {
  id: string;
  label: string;
  description?: string;
  /** Icon name for sidebar: 'settings' | 'analytics' | 'content' | 'design' | 'inventory' | 'custom' */
  icon?: string;
  /**
   * Path to the template's own dashboard page, relative to the template root.
   * e.g. "admin/index.html" or "dashboard.html"
   * This will be served via iframe inside the Bdesh dashboard shell.
   */
  templatePath?: string;
  /**
   * If set, links to a Bdesh platform page instead of embedding a template page.
   * e.g. "/dashboard/products" — useful for overriding sidebar links.
   */
  href?: string;
  /** Position in sidebar: 'top' | 'bottom' | 'after:products' | 'after:orders' */
  position?: string;
  /** Whether this page should be shown in the sidebar navigation */
  showInSidebar?: boolean;
  required?: boolean;
}

export interface DashboardEmbedConfig {
  /** Label shown in the dashboard tab */
  label?: string;
  /** Path to the template's embedded admin panel, relative to template root */
  path: string;
  /** Iframe height in pixels (default: 600) */
  height?: number;
  /** Where to embed: 'overview' (on dashboard home), 'tab' (separate tab), 'settings' (in settings page) */
  placement?: 'overview' | 'tab' | 'settings';
}

export interface DashboardConfig {
  navigation?: string[];
  setupChecklist?: DashboardRequirement[];
  quickActions?: DashboardQuickAction[];
  catalog?: DashboardCatalogConfig;
  pages?: DashboardPageConfig[];
  embed?: DashboardEmbedConfig;
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
    configSchema: {
      brand: {
        label: 'Brand',
        fields: {
          storeName: { type: 'text', label: 'Store name' },
          logo: { type: 'image', label: 'Logo' },
        },
      },
      hero: {
        label: 'Hero',
        fields: {
          headline: { type: 'text', label: 'Headline', default: `Welcome to ${name}` },
          subtext: { type: 'textarea', label: 'Subtext', default: 'Discover products selected for your customers.' },
          image: { type: 'image', label: 'Hero image' },
        },
      },
      theme: {
        label: 'Theme',
        fields: {
          primaryColor: { type: 'color', label: 'Primary color', default: '#1d4ed8' },
          accentColor: { type: 'color', label: 'Accent color', default: '#16a34a' },
        },
      },
    },
    dashboard: {
      navigation: ['overview', 'products', 'orders', 'customers', 'coupons', 'marketing', 'analytics', 'couriers', 'customize', 'settings'],
      setupChecklist: [
        {
          id: 'brand',
          label: 'Add store branding',
          description: 'Set your logo, hero copy, and main visuals.',
          href: '/dashboard/customize',
          type: 'branding',
          required: true,
        },
        {
          id: 'products',
          label: 'Add products',
          description: 'Add the products this template will show on the storefront.',
          href: '/dashboard/products/new',
          type: 'products',
          required: true,
        },
        {
          id: 'settings',
          label: 'Review store settings',
          description: 'Confirm currency, checkout, and business details.',
          href: '/dashboard/settings',
          type: 'settings',
        },
      ],
    },
  };
}
