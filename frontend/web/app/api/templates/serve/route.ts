import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const templateId = url.searchParams.get("id");
  const storeId = url.searchParams.get("storeId") || url.searchParams.get("store_id");
  const pagePath = url.searchParams.get("page"); // For template dashboard pages

  if (!templateId) {
    return new NextResponse("Missing template id", { status: 400 });
  }

  const templateDir = path.join(process.cwd(), "public", "templates", templateId);

  // Determine which HTML file to serve
  let targetPath: string;
  if (pagePath) {
    // Serve a specific template page (e.g. admin/index.html)
    // Sanitize: prevent directory traversal
    const sanitized = pagePath.replace(/\.\./g, "").replace(/^\/+/, "");
    targetPath = path.join(templateDir, sanitized);
  } else {
    targetPath = path.join(templateDir, "index.html");
  }

  if (!fs.existsSync(targetPath)) {
    return new NextResponse(
      `<!DOCTYPE html><html><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f9fafb"><div style="text-align:center"><h1 style="color:#111827;font-size:1.5rem">${pagePath ? "Page" : "Template"} Not Found</h1><p style="color:#6b7280;margin-top:0.5rem">${pagePath ? `Page "${pagePath}" does not exist in template "${templateId}".` : `Template "${templateId}" has not been built yet or was removed.`}</p></div></body></html>`,
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  let html = fs.readFileSync(targetPath, "utf-8");

  // Read manifest for API mappings and configSchema defaults
  let manifestConfig: any = {};
  const manifestPath = path.join(templateDir, "manifest.json");
  if (fs.existsSync(manifestPath)) {
    try {
      manifestConfig = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    } catch { /* ignore */ }
  }

  // Read store settings from DB and merge with template defaults
  let storeSettings: any = {};
  let storeMeta: any = {};
  if (storeId) {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { settings: true, theme: true, name: true, description: true, logo: true, banner: true },
      });
      if (store?.settings) {
        try { storeSettings = JSON.parse(store.settings); } catch {}
      }
      if (store?.theme) {
        try {
          const theme = JSON.parse(store.theme);
          storeSettings.theme = { ...storeSettings.theme, ...theme };
        } catch {}
      }
      if (store?.name) { 
        storeSettings.storeName = store.name; 
        storeMeta.name = store.name; 
        if (!storeSettings.brand) storeSettings.brand = {};
        storeSettings.brand.storeName = store.name;
      }
      if (store?.description) { 
        storeSettings.storeDescription = store.description; 
        storeMeta.description = store.description; 
      }
      if (store?.logo) { 
        storeSettings.storeLogo = store.logo; 
        storeMeta.logo = store.logo; 
        if (!storeSettings.brand) storeSettings.brand = {};
        storeSettings.brand.logo = store.logo;
      }
      if (store?.banner) { storeSettings.storeBanner = store.banner; storeMeta.banner = store.banner; }
    } catch (e) {
      console.error("[Serve] Failed to load store settings:", e);
    }
  }

  // Apply configSchema defaults for fields the store hasn't customized yet
  if (manifestConfig.configSchema) {
    for (const [sectionKey, section] of Object.entries(manifestConfig.configSchema) as [string, any][]) {
      if (!storeSettings[sectionKey]) storeSettings[sectionKey] = {};
      
      let fields: Record<string, any> = {};
      if (Array.isArray(section.fields)) {
        section.fields.forEach((f: any) => { if (f.id) fields[f.id] = f; });
      } else {
        fields = section.fields || {};
      }

      for (const [fieldKey, field] of Object.entries(fields)) {
        if (storeSettings[sectionKey][fieldKey] === undefined && field.default !== undefined) {
          storeSettings[sectionKey][fieldKey] = field.default;
        }
      }
    }
  }

  // Inject platform config script
  const configScript = `<script>
window.__PLATFORM_CONFIG__ = {
  storeId: ${storeId ? JSON.stringify(storeId) : "null"},
  settings: ${JSON.stringify(storeSettings)},
  templateId: ${JSON.stringify(templateId)},
  store: ${JSON.stringify(storeMeta)},
  manifest: {
    name: ${JSON.stringify(manifestConfig.name || templateId)},
    version: ${JSON.stringify(manifestConfig.version || "1.0.0")},
    configSchema: ${JSON.stringify(manifestConfig.configSchema || {})},
    dashboard: ${JSON.stringify(manifestConfig.dashboard || {})}
  },
  auth: {
    loginUrl: "/api/adapters/${templateId}/auth/login",
    registerUrl: "/api/adapters/${templateId}/auth/register",
    meUrl: "/api/adapters/${templateId}/auth/me",
    storageKey: "__platform_customer__"
  },
  api: {
    products: "/api/adapters/${templateId}/products",
    orders: "/api/adapters/${templateId}/orders",
    cart: "/api/adapters/${templateId}/cart",
    settings: "/api/adapters/${templateId}/settings"
  }
};
</script>`;

  // Inject theme CSS variables from store settings
  const themeVars = storeSettings.theme || {};
  const cssVarEntries = Object.entries(themeVars)
    .filter(([, v]) => typeof v === "string" && v)
    .map(([k, v]) => `  --${k.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${v};`)
    .join("\n");
  const themeStyle = cssVarEntries
    ? `<style>:root {\n${cssVarEntries}\n}</style>`
    : "";

  // Inject API interceptors
  const interceptorScript = `<script>
(function() {
  var storeId = ${storeId ? JSON.stringify(storeId) : "null"};
  if (!storeId) return;

  function getCustomerId() {
    try {
      var raw = localStorage.getItem("__platform_customer__");
      if (raw) {
        var parsed = JSON.parse(raw);
        return parsed.id || null;
      }
    } catch (e) {}
    return null;
  }

  function appendStoreId(url) {
    if (typeof url !== "string") return url;
    if (url.indexOf("/api/adapters/") !== 0) return url;
    if (url.indexOf("storeId=") !== -1 || url.indexOf("store_id=") !== -1) return url;
    var sep = url.indexOf("?") !== -1 ? "&" : "?";
    return url + sep + "storeId=" + encodeURIComponent(storeId);
  }

  // Patch fetch
  var originalFetch = window.fetch;
  window.fetch = function(input, init) {
    var url = typeof input === "string" ? input : input.url;
    var newUrl = appendStoreId(url);
    init = init || {};
    var customerId = getCustomerId();
    if (customerId && typeof url === "string" && url.indexOf("/api/adapters/") === 0) {
      init.headers = init.headers || {};
      if (typeof init.headers === "object" && !init.headers["x-customer-id"]) {
        init.headers["x-customer-id"] = customerId;
      }
    }
    if (newUrl !== url) {
      if (typeof input === "string") {
        input = newUrl;
      } else {
        input = new Request(newUrl, input);
      }
    }
    return originalFetch(input, init);
  };

  // Patch axios if present
  if (window.axios && window.axios.defaults) {
    window.axios.defaults.params = window.axios.defaults.params || {};
    window.axios.defaults.params.storeId = storeId;
    window.axios.interceptors.request.use(function(config) {
      if (config.url && config.url.indexOf("/api/adapters/") === 0) {
        config.params = config.params || {};
        if (!config.params.storeId && !config.params.store_id) {
          config.params.storeId = storeId;
        }
        var customerId = getCustomerId();
        if (customerId) {
          config.headers = config.headers || {};
          config.headers["x-customer-id"] = customerId;
        }
      }
      return config;
    });
  }

  // Intercept XMLHttpRequest
  var OriginalXHR = window.XMLHttpRequest;
  function PatchedXHR() {
    var xhr = new OriginalXHR();
    var originalOpen = xhr.open;
    var _url = "";
    xhr.open = function(method, url, async, user, password) {
      _url = url;
      var newUrl = appendStoreId(url);
      return originalOpen.call(xhr, method, newUrl, async, user, password);
    };
    var originalSend = xhr.send;
    var originalSetRequestHeader = xhr.setRequestHeader;
    xhr.send = function(body) {
      var customerId = getCustomerId();
      if (customerId && _url && _url.indexOf("/api/adapters/") === 0) {
        try { originalSetRequestHeader.call(xhr, "x-customer-id", customerId); } catch(e) {}
      }
      return originalSend.call(xhr, body);
    };
    return xhr;
  }
  window.XMLHttpRequest = PatchedXHR;

  // Expose platform helper on window for template convenience
  window.__bdesh = {
    storeId: storeId,
    getConfig: function(path, fallback) {
      var config = window.__PLATFORM_CONFIG__;
      if (!config || !config.settings) return fallback;
      var keys = path.split(".");
      var value = config.settings;
      for (var i = 0; i < keys.length; i++) {
        if (value == null) return fallback;
        value = value[keys[i]];
      }
      return value !== undefined ? value : fallback;
    },
    applyTheme: function() {
      var config = window.__PLATFORM_CONFIG__;
      if (!config || !config.settings || !config.settings.theme) return;
      var theme = config.settings.theme;
      var root = document.documentElement;
      Object.keys(theme).forEach(function(key) {
        var cssVar = "--" + key.replace(/([A-Z])/g, "-$1").toLowerCase();
        root.style.setProperty(cssVar, theme[key]);
      });
    }
  };
})();
</script>`;

  // Insert before </head>
  const injection = configScript + themeStyle + interceptorScript;
  if (html.includes("</head>")) {
    html = html.replace("</head>", injection + "</head>");
  } else {
    html = injection + html;
  }

  // Add post-render DOM mutation script before </body>
  const domMutationScript = `<script>
(function() {
  var config = window.__PLATFORM_CONFIG__;
  if (!config || !config.settings) return;
  var s = config.settings;

  function get(section, key) {
    if (s[section] && s[section][key] !== undefined) return s[section][key];
    if (s[key] !== undefined) return s[key];
    return undefined;
  }

  function applySettings() {
    var root = document.getElementById("root");
    if (!root || !root.children.length) return false;

    // ── Store Name / Logo ──
    var storeName = get("brand", "storeName") || config.store?.name;
    if (storeName) {
      document.title = storeName;
      // Update logo text elements (common selectors)
      var logoEls = document.querySelectorAll('.logo, .site-name, .store-name, .brand-name, [class*="logo"] a, header a[href="/"], .header-logo');
      logoEls.forEach(function(el) {
        if (el.tagName === "IMG") return;
        if (el.children.length === 0 || (el.children.length === 1 && el.children[0].tagName !== "IMG")) {
          if (el.textContent && el.textContent.trim().length > 0 && el.textContent.trim().length < 30) {
            el.textContent = storeName;
          }
        }
      });
    }

    var storeLogo = get("brand", "logo") || config.store?.logo;
    if (storeLogo) {
      var logoImgs = document.querySelectorAll('.logo img, .header-logo img, .site-logo img, [class*="logo"] img');
      logoImgs.forEach(function(img) { img.src = storeLogo; });
    }

    // ── Hero Section ──
    var heroTitle = get("hero", "heroTitle");
    var heroSubtitle = get("hero", "heroSubtitle");
    var heroImage = get("hero", "heroImage") || get("hero", "image");
    var heroCtaText = get("hero", "heroCtaText");
    var heroCtaLink = get("hero", "heroCtaLink");

    // Find hero section - look for large banner/hero areas
    var heroSection = document.querySelector('.hero, .hero-banner, .hero-section, [class*="hero"], .banner, .main-banner, .slider, .slideshow');
    if (heroSection) {
      if (heroTitle) {
        var h1 = heroSection.querySelector("h1, h2, .hero-title, [class*='hero-title'], [class*='title']");
        if (h1) h1.textContent = heroTitle;
      }
      if (heroSubtitle) {
        var sub = heroSection.querySelector("p, .hero-subtitle, .hero-text, [class*='subtitle'], [class*='description']");
        if (sub) sub.textContent = heroSubtitle;
      }
      if (heroImage) {
        // Try to find and replace background images in hero section
        var foundBg = false;
        var allHeroEls = [heroSection].concat(Array.from(heroSection.querySelectorAll("*")));
        for (var i = 0; i < allHeroEls.length; i++) {
          var el = allHeroEls[i];
          var computedBg = window.getComputedStyle(el).backgroundImage;
          if (computedBg && computedBg !== "none") {
            el.style.backgroundImage = "url(" + heroImage + ")";
            foundBg = true;
            break;
          }
        }
        // Also try img tags
        var heroImgs = heroSection.querySelectorAll("img");
        if (heroImgs.length > 0) {
          heroImgs[0].src = heroImage;
        }
        // If no bg found and no img, force it on the hero section itself  
        if (!foundBg && heroImgs.length === 0) {
          heroSection.style.backgroundImage = "url(" + heroImage + ")";
          heroSection.style.backgroundSize = "cover";
          heroSection.style.backgroundPosition = "center";
        }
      }
      if (heroCtaText) {
        var cta = heroSection.querySelector("a, button, .cta, .btn, [class*='cta'], [class*='btn']");
        if (cta) cta.textContent = heroCtaText;
      }
      if (heroCtaLink) {
        var ctaLink = heroSection.querySelector("a.cta, a.btn, a[class*='cta'], a[class*='btn']");
        if (ctaLink) ctaLink.href = heroCtaLink;
      }
    }

    // ── Announcement Bar ──
    var announcementText = get("announcementBar", "announcementText") || get("announcement", "message");
    var announcementEnabled = get("announcementBar", "announcementEnabled");
    if (announcementEnabled === false) {
      var annBar = document.querySelector('.announcement, .announcement-bar, [class*="announcement"], .topbar, .top-bar');
      if (annBar) annBar.style.display = "none";
    } else if (announcementText) {
      var annEl = document.querySelector('.announcement, .announcement-bar, [class*="announcement"], .topbar, .top-bar');
      if (annEl) {
        var textEl = annEl.querySelector("p, span, a, [class*='text']") || annEl;
        if (textEl.childNodes.length <= 3) textEl.textContent = announcementText;
      }
    }

    // ── Theme Colors via CSS variables ──
    var theme = s.theme || {};
    var root = document.documentElement;
    if (theme.primaryColor) root.style.setProperty("--primary-color", theme.primaryColor);
    if (theme.secondaryColor) root.style.setProperty("--secondary-color", theme.secondaryColor);
    if (theme.accentColor) root.style.setProperty("--accent-color", theme.accentColor);
    if (theme.mutedColor) root.style.setProperty("--muted-color", theme.mutedColor);
    if (theme.fontFamilyHeading) root.style.setProperty("--font-heading", theme.fontFamilyHeading);
    if (theme.fontFamilyBody) root.style.setProperty("--font-body", theme.fontFamilyBody);

    return true;
  }

  // Wait for React to render, then apply
  var attempts = 0;
  var interval = setInterval(function() {
    attempts++;
    if (applySettings() || attempts > 50) {
      clearInterval(interval);
      // Re-apply after a short delay for async React renders
      setTimeout(applySettings, 500);
      setTimeout(applySettings, 1500);
    }
  }, 100);

  // Also watch for DOM changes and re-apply on route navigation
  if (window.MutationObserver) {
    var lastApply = 0;
    var observer = new MutationObserver(function() {
      var now = Date.now();
      if (now - lastApply > 1000) {
        lastApply = now;
        setTimeout(applySettings, 100);
      }
    });
    setTimeout(function() {
      var root = document.getElementById("root");
      if (root) observer.observe(root, { childList: true, subtree: true });
    }, 2000);
  }
})();
</script>`;

  if (html.includes("</body>")) {
    html = html.replace("</body>", domMutationScript + "</body>");
  } else {
    html += domMutationScript;
  }

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
