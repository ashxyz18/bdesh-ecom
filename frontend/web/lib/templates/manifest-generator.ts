import {
  TemplateManifest,
  SectionMapping,
  DetectedSections,
  createDefaultManifest,
} from './manifest';

export function detectSections(htmlContent: string): DetectedSections {
  const sections: DetectedSections = {};

  const patterns = {
    logo: [
      /\.logo\s+img/i,
      /\.navbar-brand\s+img/i,
      /\.site-logo\s+img/i,
      /\.brand\s+img/i,
    ],
    hero: [
      /\.hero\s/i,
      /\.banner\s/i,
      /\.slider\s/i,
      /\.carousel\s/i,
      /class="[^"]*hero[^"]*"/i,
    ],
    products: [
      /\.product[s-]?(grid|card|item)/i,
      /#product[s]?/i,
      /\.shop-grid/i,
      /class="[^"]*product[^"]*"/i,
    ],
    footer: [
      /\.footer/i,
      /\.site-footer/i,
      /\.main-footer/i,
      /<footer/i,
    ],
    nav: [
      /\.navbar/i,
      /\.navigation/i,
      /class="[^"]*nav[^"]*"/i,
      /<nav/i,
    ],
    cart: [
      /\.cart[^-]/i,
      /\.shopping-cart/i,
      /#cart/i,
      /\.bag/i,
    ],
    search: [
      /\.search[^-]/i,
      /#search/i,
      /\.search-box/i,
    ],
    searchInput: [
      /#searchInput/i,
      /input.*placeholder="[^"]*search[^"]*"/i,
    ],
  };

  for (const [section, regexes] of Object.entries(patterns)) {
    for (const regex of regexes) {
      if (regex.test(htmlContent)) {
        const match = htmlContent.match(regex);
        if (match) {
          (sections as any)[section] = extractSelectorFromMatch(match[0], section);
          break;
        }
      }
    }
  }

  return sections;
}

function extractSelectorFromMatch(match: string, section: string): string {
  const classMatch = match.match(/class="([^"]*)"/);
  const idMatch = match.match(/id="([^"]*)"/);
  const tagMatch = match.match(/<(\w+)/);

  if (idMatch) {
    return `#${idMatch[1]}`;
  }

  if (classMatch) {
    const classes = classMatch[1].split(/\s+/).filter(c => !['section', 'hero', 'banner', 'slider'].includes(c.toLowerCase()));
    if (classes.length > 0) {
      const primaryClass = classes.find(c => !['active', 'show', 'hidden'].includes(c.toLowerCase())) || classes[0];
      return `.${primaryClass}`;
    }
  }

  if (tagMatch) {
    return tagMatch[1];
  }

  return `.${section}`;
}

export function generateSectionsFromDetection(
  detected: DetectedSections,
  logo?: string,
  heroImage?: string,
  heroHeadline?: string
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
    if (heroImage) {
      sections.heroImage = {
        selector: `${detected.hero} img`,
        type: 'attribute',
        attribute: 'src',
        source: 'store.settings.heroImage',
      };
    }
    if (heroHeadline) {
      sections.heroHeadline = {
        selector: `${detected.hero} h1, ${detected.hero} h2, ${detected.hero} h3`,
        type: 'text',
        source: 'store.settings.heroHeadline',
      };
    }
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
  files: { path: string; content: Buffer }[]
): Promise<{ manifest: TemplateManifest; htmlContent: string }> {
  const htmlFiles = files.filter(f =>
    f.path.endsWith('.html') || f.path.endsWith('.htm')
  );

  const cssFiles = files
    .filter(f => f.path.startsWith('css/') && f.path.endsWith('.css'))
    .map(f => f.path);

  const jsFiles = files
    .filter(f => f.path.startsWith('js/') && (f.path.endsWith('.js') || f.path.endsWith('.javascript')))
    .map(f => f.path);

  const mainHtml = htmlFiles.find(f =>
    f.path.toLowerCase() === 'index.html' ||
    f.path.toLowerCase() === templateId + '.html'
  ) || htmlFiles[0];

  const htmlContent = mainHtml?.content.toString('utf-8') || '';

  const manifest = createDefaultManifest(
    templateId,
    templateName,
    mainHtml?.path || 'index.html',
    cssFiles,
    jsFiles
  );

  manifest.description = `Template: ${templateName}`;

  const detected = detectSections(htmlContent);
  manifest.sections = generateSectionsFromDetection(detected);

  if (!manifest.thumbnail) {
    const imgMatch = htmlContent.match(/<img[^>]+src="([^"]+)"/i);
    if (imgMatch) {
      manifest.thumbnail = imgMatch[1];
    }
  }

  if (!manifest.previewUrl) {
    manifest.previewUrl = `/templates/${templateId}/${mainHtml?.path || 'index.html'}`;
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