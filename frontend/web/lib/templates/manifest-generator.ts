import {
  TemplateManifest,
  SectionMapping,
  createDefaultManifest,
  DashboardConfig,
} from './manifest';
import path from 'path';
import fs from 'fs';

export function detectSections(htmlContent: string): Record<string, string> {
  const sections: Record<string, string> = {};

  const patterns: Record<string, RegExp[]> = {
    logo: [/\.logo\s+img/i, /\.navbar-brand\s+img/i, /\.site-logo\s+img/i, /\.brand\s+img/i],
    hero: [/\.hero\s/i, /\.banner\s/i, /\.slider\s/i, /\.carousel\s/i, /class="[^"]*hero[^"]*"/i],
    products: [/\.product[s-]?(grid|card|item)/i, /#product[s]?/i, /\.shop-grid/i, /class="[^"]*product[^"]*"/i],
    footer: [/\.footer/i, /\.site-footer/i, /\.main-footer/i, /<footer/i],
    nav: [/\.navbar/i, /\.navigation/i, /class="[^"]*nav[^"]*"/i, /<nav/i],
    cart: [/\.cart[^-]/i, /\.shopping-cart/i, /#cart/i, /\.bag/i],
    search: [/\.search[^-]/i, /#search/i, /\.search-box/i],
  };

  for (const [section, regexes] of Object.entries(patterns)) {
    for (const regex of regexes) {
      if (regex.test(htmlContent)) {
        const match = htmlContent.match(regex);
        if (match) {
          const classMatch = match[0].match(/class="([^"]*)"/);
          const idMatch = match[0].match(/id="([^"]*)"/);
          if (idMatch) {
            sections[section] = `#${idMatch[1]}`;
          } else if (classMatch) {
            const classes = classMatch[1].split(/\s+/).filter(
              c => !['section', 'hero', 'banner', 'slider', 'active', 'show', 'hidden'].includes(c.toLowerCase())
            );
            sections[section] = classes.length > 0 ? `.${classes[0]}` : `.${section}`;
          }
          break;
        }
      }
    }
  }

  return sections;
}

function getSourceSearchText(files: { path: string; content: Buffer }[]): string {
  const textExtensions = /\.(html?|tsx?|jsx?|css|scss|json)$/i;
  return files
    .filter((file) => textExtensions.test(file.path) && file.content.length < 1024 * 1024)
    .map((file) => {
      try {
        return file.content.toString('utf-8');
      } catch {
        return '';
      }
    })
    .join('\n');
}

function inferDashboardConfig(sourceText: string, detected: Record<string, string>): DashboardConfig {
  const text = sourceText.toLowerCase();
  const hasProducts = Boolean(detected.products) || /\b(product|products|catalog|shop|menu item|collection)\b/i.test(sourceText);
  const hasOrders = /\b(cart|checkout|order|orders|payment)\b/i.test(sourceText);
  const hasDelivery = /\b(delivery|shipping|courier|tracking)\b/i.test(sourceText);
  const collections = inferCollections(sourceText);
  const filters = inferFilters(sourceText);

  const navigation = ['overview'];
  if (hasProducts) navigation.push('products');
  if (hasOrders) navigation.push('orders');
  navigation.push('analytics');
  if (hasDelivery) navigation.push('couriers');
  navigation.push('customize', 'settings');

  const setupChecklist: DashboardConfig['setupChecklist'] = [
    {
      id: 'branding',
      label: 'Review template branding',
      description: 'Set the logo, colors, and hero content inferred from this template.',
      href: '/dashboard/customize',
      type: 'branding',
      required: true,
    },
  ];

  if (hasProducts) {
    setupChecklist.push({
      id: text.includes('menu') ? 'menu-items' : collections.length > 0 ? 'catalog-sections' : 'products',
      label: text.includes('menu')
        ? 'Add menu items'
        : collections.length > 0
          ? `Create ${collections.map((collection) => collection.label).join(', ')} sections`
          : 'Add products',
      description: text.includes('menu')
        ? 'Create the menu items this React template will display.'
        : collections.length > 0
          ? 'This template uses specific storefront sections or filters. Add products and assign matching categories.'
        : 'Create the product catalog this React template will display.',
      href: '/dashboard/products/new',
      type: 'products',
      required: true,
    });
  }

  setupChecklist.push({
    id: 'settings',
    label: hasOrders ? 'Review checkout settings' : 'Review store settings',
    description: hasOrders
      ? 'Confirm currency, payment, and checkout details before publishing.'
      : 'Confirm currency, locale, and business details before publishing.',
    href: '/dashboard/settings',
    type: 'settings',
  });

  if (hasDelivery) {
    setupChecklist.push({
      id: 'delivery',
      label: 'Connect delivery options',
      description: 'This template appears to use delivery or shipping information.',
      href: '/dashboard/couriers',
      type: 'couriers',
    });
  }

  return {
    navigation,
    setupChecklist,
    catalog: {
      label: collections.length > 0 ? 'Template Catalog Sections' : undefined,
      itemLabel: text.includes('menu') ? 'Menu Items' : 'Products',
      collections,
      filters,
    },
  };
}

function inferCollections(sourceText: string) {
  const candidates: [string, string, RegExp, boolean][] = [
    // Fashion / Clothing
    ['men', 'Men', /\b(men|mens|men's)\b/i, true],
    ['women', 'Women', /\b(women|womens|women's|ladies)\b/i, true],
    ['kids', 'Kids', /\b(kids|children|boys|girls)\b/i, true],
    ['new-arrivals', 'New Arrivals', /\b(new arrivals|new-arrivals|latest|just in)\b/i, true],
    ['sale', 'Sale', /\b(sale|discount|clearance|offers|deals)\b/i, false],
    ['shoes', 'Shoes', /\b(shoes|sneakers|footwear|boots|sandals)\b/i, false],
    ['apparel', 'Apparel', /\b(apparel|clothing|shirts|hoodies|jackets|dresses|pants|jeans)\b/i, false],
    ['accessories', 'Accessories', /\b(accessories|bags|caps|socks|watches|jewelry|jewellery)\b/i, false],
    // Electronics
    ['phones', 'Phones', /\b(phone|mobile|smartphone|iphone|android)\b/i, false],
    ['laptops', 'Laptops', /\b(laptop|notebook|macbook|computer)\b/i, false],
    ['gadgets', 'Gadgets', /\b(gadget|headphone|earbuds|tablet|wearable|smartwatch)\b/i, false],
    // Food / Restaurant
    ['starters', 'Starters', /\b(starter|appetizer|snack|soup)\b/i, false],
    ['mains', 'Main Course', /\b(main course|entree|dinner|lunch)\b/i, false],
    ['desserts', 'Desserts', /\b(dessert|sweet|cake|ice cream|pastry)\b/i, false],
    ['drinks', 'Drinks', /\b(drink|beverage|coffee|tea|juice|smoothie)\b/i, false],
    // Beauty
    ['skincare', 'Skincare', /\b(skincare|skin care|moisturizer|serum|cleanser)\b/i, false],
    ['makeup', 'Makeup', /\b(makeup|make-up|lipstick|foundation|mascara)\b/i, false],
    // Home / Furniture
    ['furniture', 'Furniture', /\b(furniture|sofa|chair|table|desk|bed)\b/i, false],
    ['decor', 'Decor', /\b(decor|decoration|lamp|rug|curtain|pillow)\b/i, false],
    // Sports
    ['sportswear', 'Sportswear', /\b(sportswear|athletic|gym|workout|running)\b/i, false],
    // Featured / Trending
    ['featured', 'Featured', /\b(featured|spotlight|editor.?s? pick|top pick|best seller|bestseller)\b/i, false],
    ['trending', 'Trending', /\b(trending|popular|hot|most viewed)\b/i, false],
  ];

  return candidates
    .filter(([, , pattern]) => pattern.test(sourceText))
    .map(([id, label, , isRequired]) => ({
      id,
      label,
      required: isRequired,
    }));
}

function inferFilters(sourceText: string) {
  const filters: NonNullable<NonNullable<DashboardConfig['catalog']>['filters']> = [];

  const genderOptions = [
    /\b(men|mens|men's)\b/i.test(sourceText) ? 'Men' : null,
    /\b(women|womens|women's|ladies)\b/i.test(sourceText) ? 'Women' : null,
    /\b(kids|children|boys|girls)\b/i.test(sourceText) ? 'Kids' : null,
    /\b(unisex)\b/i.test(sourceText) ? 'Unisex' : null,
  ].filter(Boolean) as string[];

  if (genderOptions.length > 0) {
    filters.push({
      id: 'audience',
      label: 'Audience',
      options: genderOptions,
      required: true,
    });
  }

  if (/\b(size|sizes|sizing|xs|small|medium|large|xl|xxl)\b/i.test(sourceText)) {
    filters.push({
      id: 'size',
      label: 'Size',
      options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    });
  }

  if (/\b(color|colour|black|white|red|blue|green|navy|gray|grey|pink|yellow|orange|brown)\b/i.test(sourceText)) {
    filters.push({
      id: 'color',
      label: 'Color',
      options: ['Black', 'White', 'Red', 'Blue', 'Green', 'Navy', 'Gray', 'Pink'],
    });
  }

  if (/\b(price range|price filter|budget|premium|luxury|affordable)\b/i.test(sourceText)) {
    filters.push({
      id: 'price-range',
      label: 'Price Range',
      options: ['Under ৳500', '৳500-৳1500', '৳1500-৳5000', 'Above ৳5000'],
    });
  }

  if (/\b(brand|brands|nike|adidas|puma|zara|h&m|gucci)\b/i.test(sourceText)) {
    filters.push({
      id: 'brand',
      label: 'Brand',
      options: [],  // Will be populated by merchant in dashboard
    });
  }

  if (/\b(material|cotton|silk|polyester|leather|denim|linen|wool)\b/i.test(sourceText)) {
    filters.push({
      id: 'material',
      label: 'Material',
      options: ['Cotton', 'Silk', 'Polyester', 'Leather', 'Denim'],
    });
  }

  return filters;
}

function inferConfigSchema(sourceText: string, detected: Record<string, string>) {
  const text = sourceText.toLowerCase();
  const isRestaurant = /\b(menu|restaurant|cafe|food|dish|kitchen)\b/.test(text);

  return {
    brand: {
      label: isRestaurant ? 'Restaurant Brand' : 'Brand',
      fields: {
        storeName: { type: 'text' as const, label: isRestaurant ? 'Restaurant name' : 'Store name' },
        logo: { type: 'image' as const, label: 'Logo' },
      },
    },
    hero: {
      label: detected.hero ? 'Hero Section' : 'Main Banner',
      fields: {
        headline: {
          type: 'text' as const,
          label: 'Headline',
          default: isRestaurant ? 'Fresh flavors, made for you' : 'Welcome to our store',
        },
        subtext: {
          type: 'textarea' as const,
          label: 'Subtext',
          default: isRestaurant
            ? 'Order your favorites online.'
            : 'Discover products selected for your customers.',
        },
        image: { type: 'image' as const, label: 'Hero image' },
      },
    },
    theme: {
      label: 'Theme',
      fields: {
        primaryColor: { type: 'color' as const, label: 'Primary color', default: '#1d4ed8' },
        accentColor: { type: 'color' as const, label: 'Accent color', default: isRestaurant ? '#dc2626' : '#16a34a' },
      },
    },
  };
}

export function generateSectionsFromDetection(
  detected: Record<string, string>
): Record<string, SectionMapping> {
  const sections: Record<string, SectionMapping> = {};

  if (detected.logo) {
    sections.logo = {
      selector: detected.logo,
      type: 'attribute',
      attribute: 'src',
      source: 'store.logo',
      fallback: 'https://via.placeholder.com/200x60?text=Logo',
    };
  }

  if (detected.hero) {
    sections.heroImage = {
      selector: `${detected.hero} img`,
      type: 'attribute',
      attribute: 'src',
      source: 'store.settings.heroImage',
    };
    sections.heroHeadline = {
      selector: `${detected.hero} h1, ${detected.hero} h2, ${detected.hero} h3`,
      type: 'text',
      source: 'store.settings.heroHeadline',
    };
  }

  if (detected.products) {
    sections.products = {
      selector: detected.products,
      type: 'products',
      cardTemplate: 'default',
    };
  }

  if (detected.footer) {
    sections.footerCopyright = {
      selector: `${detected.footer} .copyright, ${detected.footer} p:last-child`,
      type: 'text',
      template: `© {{year}} {{storeName}}. All Rights Reserved.`,
    };
  }

  if (detected.cart) {
    sections.cartBadge = {
      selector: '.badge-count, .cart-count, .nav-badge',
      type: 'cart-count',
    };
  }

  if (detected.search) {
    sections.searchOverlay = {
      selector: detected.search,
      type: 'visibility',
      visibility: 'show',
    };
  }

  return sections;
}

export async function generateManifestFromFiles(
  templateId: string,
  templateName: string,
  files: { path: string; content: Buffer }[],
  templateDir: string
): Promise<{ manifest: TemplateManifest; htmlContent: string }> {
  let htmlContent = "";
  let entryPoint = "index.html";
  let cssFiles: string[] = [];
  let jsFiles: string[] = [];

  const buildIndexPath = path.join(templateDir, "index.html");
  if (fs.existsSync(buildIndexPath)) {
    htmlContent = fs.readFileSync(buildIndexPath, "utf-8");
    entryPoint = "index.html";

    const staticDir = path.join(templateDir, "static");
    if (fs.existsSync(staticDir)) {
      const staticFiles = fs.readdirSync(staticDir);
      for (const dir of staticFiles) {
        const dirPath = path.join(staticDir, dir);
        if (fs.statSync(dirPath).isDirectory()) {
          const dirFiles = fs.readdirSync(dirPath);
          if (dir === "css") {
            cssFiles = dirFiles.map(f => `static/css/${f}`);
          } else if (dir === "js") {
            jsFiles = dirFiles.map(f => `static/js/${f}`);
          }
        }
      }
    }

    if (cssFiles.length === 0) {
      const cssMatches = htmlContent.match(/href="([^"]*\.css)"/g) || [];
      cssFiles = cssMatches.map(m => {
        const match = m.match(/href="([^"]*)"/);
        return match ? match[1] : "";
      }).filter(Boolean);
    }

    if (jsFiles.length === 0) {
      const jsMatches = htmlContent.match(/src="([^"]*\.js)"/g) || [];
      jsFiles = jsMatches.map(m => {
        const match = m.match(/src="([^"]*)"/);
        return match ? match[1] : "";
      }).filter(Boolean);
    }
  }

  const manifest = createDefaultManifest(
    templateId,
    templateName,
    entryPoint,
    cssFiles,
    jsFiles
  );

  manifest.description = `React template: ${templateName}`;

  const sourceText = `${htmlContent}\n${getSourceSearchText(files)}`;
  const detected = detectSections(sourceText);
  manifest.sections = generateSectionsFromDetection(detected);
  manifest.configSchema = inferConfigSchema(sourceText, detected);
  manifest.dashboard = inferDashboardConfig(sourceText, detected);

  if (!manifest.thumbnail) {
    const imgMatch = htmlContent.match(/<img[^>]+src="([^"]+)"/i);
    if (imgMatch) {
      manifest.thumbnail = imgMatch[1];
    }
  }

  if (!manifest.previewUrl) {
    manifest.previewUrl = `/templates/${templateId}/${entryPoint}`;
  }

  return { manifest, htmlContent };
}

export function generateProductCardTemplate(): string {
  return `
<a href="{{productUrl}}" class="product-card" data-product-id="{{productId}}">
  <div class="product-image">
    <img src="{{image}}" alt="{{name}}" loading="lazy">
    {{#if badge}}
    <span class="badge">{{badge}}</span>
    {{/if}}
    <div class="rating">{{rating}}&#9733;</div>
    <button class="wishlist-btn" data-product-id="{{productId}}">
      <i class="far fa-heart"></i>
    </button>
    <button class="quick-add" data-product-id="{{productId}}">Quick Add</button>
  </div>
  <div class="product-info">
    <h3>{{name}}</h3>
    <div class="price">
      <span class="sale-price">৳{{price}}</span>
      {{#if comparePrice}}
      <span class="original-price">৳{{comparePrice}}</span>
      <span class="discount">{{discount}}% OFF</span>
      {{/if}}
    </div>
  </div>
</a>
`.trim();
}
