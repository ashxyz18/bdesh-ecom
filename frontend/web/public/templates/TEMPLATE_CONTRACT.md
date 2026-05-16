# Bdesh Platform Template Developer Contract

This document describes how to build templates that work with the Bdesh e-commerce platform.

## Overview

The Bdesh platform renders templates in an iframe and injects configuration dynamically. Templates must follow a simple contract to receive store settings, theme colors, and API access.

## ZIP Structure

For React templates, upload a ZIP with your normal React project and an optional dashboard contract file:

```text
my-template.zip
  package.json
  src/
  public/
  index.html
  bdesh.dashboard.json
```

The platform can generate `manifest.json` automatically during upload. Advanced template authors may still include a `manifest.json` or `bdesh.template.json` at the ZIP root:

```json
{
  "id": "my-template",
  "name": "My Template",
  "version": "1.0.0",
  "entryPoint": "index.html",
  "type": "react",
  "description": "A brief description",
  "previewUrl": "/templates/my-template/index.html",
  "api": {
    "mappings": {
      "products": {
        "id": "id",
        "name": "name",
        "price": "price",
        "image": "images[0]"
      }
    }
  },
  "configSchema": {
    "hero": {
      "label": "Hero Section",
      "fields": {
        "headline": { "type": "text", "label": "Headline", "default": "Welcome" },
        "image": { "type": "image", "label": "Hero Image", "default": "" }
      }
    }
  }
}
```

## Dashboard Requirements File

For unique React templates, include `bdesh.dashboard.json` at the root of your ZIP. This is the recommended way to make the merchant dashboard match your template exactly.

Use this exact file name:

```text
bdesh.dashboard.json
```

If the file exists but is not valid JSON or does not contain dashboard requirements, upload will fail with a clear error. If the file is missing, the platform scans React/JS/TS/CSS/HTML files and tries to infer products, Men/Women/Kids sections, filters, checkout, delivery, and customization fields automatically.

Example for a Nike-style template with Men/Women sections and filters:

```json
{
  "dashboard": {
    "navigation": ["overview", "products", "orders", "analytics", "customize", "settings"],
    "setupChecklist": [
      {
        "id": "nike-catalog",
        "label": "Create Nike catalog sections",
        "description": "Add products for Men, Women, New Arrivals, and Sale sections.",
        "href": "/dashboard/products/new",
        "type": "products",
        "required": true
      },
      {
        "id": "nike-branding",
        "label": "Set Nike-style hero and branding",
        "href": "/dashboard/customize",
        "type": "branding",
        "required": true
      }
    ],
    "catalog": {
      "label": "Nike Store Catalog",
      "itemLabel": "Products",
      "collections": [
        { "id": "men", "label": "Men", "required": true },
        { "id": "women", "label": "Women", "required": true },
        { "id": "new-arrivals", "label": "New Arrivals", "required": true },
        { "id": "sale", "label": "Sale" }
      ],
      "filters": [
        { "id": "audience", "label": "Audience", "options": ["Men", "Women"], "required": true },
        { "id": "size", "label": "Size", "options": ["XS", "S", "M", "L", "XL"] },
        { "id": "color", "label": "Color", "options": ["Black", "White", "Red", "Blue"] }
      ],
      "productFields": [
        { "key": "badge", "label": "Product badge", "type": "text" },
        { "key": "isFeatured", "label": "Featured product", "type": "boolean" }
      ]
    },
    "pages": [
      { "id": "home", "label": "Home Page", "href": "/dashboard/customize", "required": true },
      { "id": "product", "label": "Product Detail Page", "href": "/dashboard/products" }
    ]
  },
  "configSchema": {
    "hero": {
      "label": "Hero Section",
      "fields": {
        "headline": { "type": "text", "label": "Headline", "default": "Just Do It" },
        "image": { "type": "image", "label": "Hero Image" }
      }
    },
    "theme": {
      "label": "Theme",
      "fields": {
        "primaryColor": { "type": "color", "label": "Primary Color", "default": "#111111" },
        "accentColor": { "type": "color", "label": "Accent Color", "default": "#f97316" }
      }
    }
  }
}
```

The explicit file always gives better results than inference because every template can be unique.

## Platform Injection

When a template is rendered, the platform injects a script before `</head>`:

```html
<script>
window.__PLATFORM_CONFIG__ = {
  storeId: "store_cuid",
  templateId: "my-template",
  settings: {
    hero: { headline: "Custom headline", image: "..." },
    theme: { primaryColor: "#000000", accentColor: "#e74c3c" }
  }
};
</script>
```

Templates should read this object to apply customization.

## API Access

The platform intercepts all fetch/axios/XMLHttpRequest calls to `/api/adapters/{templateId}` and automatically appends `storeId` as a query parameter.

Your template should make API calls like:
```javascript
fetch('/api/adapters/my-template/products')
axios.get('/api/adapters/my-template/products')
```

The adapter will:
1. Receive the request with `storeId` appended
2. Fetch data from the platform database
3. Map platform fields to template fields using `manifest.json` `api.mappings`
4. Return data in the format your template expects

## configSchema

The `configSchema` object declares what the dashboard should render for customization. Supported field types:

| Type | Description |
|------|-------------|
| `text` | Single-line text input |
| `textarea` | Multi-line text input |
| `color` | Color picker |
| `image` | Image upload |
| `number` | Numeric input |
| `boolean` | Toggle/checkbox |
| `select` | Dropdown select with options |

Example:
```json
{
    "hero": {
      "label": "Hero Section",
      "fields": {
        "headline": { "type": "text", "label": "Headline", "default": "Welcome" },
        "bgColor": { "type": "color", "label": "Background", "default": "#ffffff" }
    }
  }
}
```

The platform also provides baseline customization sections for every store, even if a template does not define them: brand identity, announcement bar, hero, theme and layout, navigation, product cards, checkout, delivery, SEO and sharing, social links, policies, and advanced CSS/script fields. Template `configSchema` sections are merged on top of these defaults.

Dashboard navigation supports these module IDs:

| ID | Dashboard Area |
|----|----------------|
| `overview` | Main dashboard |
| `products` | Product catalog |
| `orders` | Order operations |
| `customers` | Customer list |
| `coupons` | Discounts and coupon codes |
| `marketing` | Flash sales and social channels |
| `analytics` | Reports and performance |
| `couriers` | Delivery integrations |
| `customize` | Store/template customization |
| `settings` | Store settings |

## Recommended Pattern: usePlatformConfig Hook

For React templates, create a small hook:

```javascript
export function usePlatformConfig() {
  const [config, setConfig] = useState(() => {
    if (typeof window !== 'undefined' && window.__PLATFORM_CONFIG__) {
      return window.__PLATFORM_CONFIG__;
    }
    return { settings: {}, storeId: null, templateId: null };
  });
  return config;
}

export function getConfigValue(config, path, fallback = '') {
  if (!config?.settings) return fallback;
  const keys = path.split('.');
  let value = config.settings;
  for (const key of keys) {
    if (value == null) return fallback;
    value = value[key];
  }
  return value !== undefined ? value : fallback;
}
```

Usage:
```javascript
const config = usePlatformConfig();
const headline = getConfigValue(config, 'hero.headline', 'Default Headline');
```

## Theme Colors

Apply CSS custom properties for dynamic theming:

```javascript
export function applyThemeColors(config) {
  if (!config?.settings?.theme) return;
  const theme = config.settings.theme;
  const root = document.documentElement;
  if (theme.primaryColor) root.style.setProperty('--primary-color', theme.primaryColor);
  if (theme.secondaryColor) root.style.setProperty('--secondary-color', theme.secondaryColor);
  if (theme.accentColor) root.style.setProperty('--accent-color', theme.accentColor);
}
```

And in your CSS:
```css
:root {
  --primary-color: #000000;
  --secondary-color: #f5f5f5;
  --accent-color: #e74c3c;
}
.btn {
  background-color: var(--primary-color);
}
```

## Environment Variables

The platform sets these during build:

| Variable | Value |
|----------|-------|
| `REACT_APP_API_URL` | `/api/adapters/{templateId}` |
| `PUBLIC_URL` | `/templates/{templateId}` |
| `CI` | `true` |
| `DISABLE_ESLINT_PLUGIN` | `true` |

## Adapter Field Mappings

The adapter uses `api.mappings` to transform platform data. Supported path syntax:

| Mapping | Meaning |
|---------|---------|
| `"name": "name"` | Maps `platform.name` to `template.name` |
| `"image": "images[0]"` | Maps `platform.images[0]` to `template.image` |
| `"category": "tags[0]"` | Maps first tag to category |

## Multi-Page Static Templates

For non-React templates, place all files in the template root. The platform will serve `index.html` with config injected. Use relative paths for assets.

## Build Requirements

- Templates are uploaded without `node_modules`
- The platform runs `npm install` and `npm run build`
- Build output must go to `build/` (CRA) or `dist/` (Vite)
- Ensure your build completes with `CI=true` and `DISABLE_ESLINT_PLUGIN=true`

## Store Data Available

The platform injects these store values into `settings`:

| Key | Source |
|-----|--------|
| `storeName` | Store.name |
| `storeDescription` | Store.description |
| `storeLogo` | Store.logo |
| `storeBanner` | Store.banner |
| `theme.*` | Store.theme JSON merged with configSchema theme |
| `[configSchema sections]` | Store.settings JSON |
