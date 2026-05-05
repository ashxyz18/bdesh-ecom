import type { HomeSectionConfig } from "../store-templates/engine/types"

export type FieldType = "text" | "textarea" | "number" | "select" | "color" | "boolean" | "image" | "list"

export interface FieldDef {
  key: string
  label: string
  type: FieldType
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  itemFields?: FieldDef[]
  newItemDefault?: Record<string, any>
}

export interface SectionTypeConfig {
  id: string
  label: string
  icon: string
  category: "basic" | "products" | "social" | "advanced" | "portfolio" | "corporate" | "blog" | "restaurant" | "education"
  description: string
  defaultProps: Record<string, any>
  fields: FieldDef[]
}

const ICON_OPTIONS = [
  { value: "Truck", label: "Truck" },
  { value: "ShieldCheck", label: "Shield" },
  { value: "RefreshCcw", label: "Refresh" },
  { value: "Headphones", label: "Support" },
  { value: "CreditCard", label: "Card" },
  { value: "Package", label: "Package" },
  { value: "Star", label: "Star" },
  { value: "Clock", label: "Clock" },
  { value: "Zap", label: "Zap" },
  { value: "Settings", label: "Settings" },
  { value: "Gift", label: "Gift" },
  { value: "ShoppingBag", label: "Shopping" },
  { value: "Utensils", label: "Food" },
  { value: "Shirt", label: "Clothing" },
  { value: "Laptop", label: "Tech" },
  { value: "Home", label: "Home" },
  { value: "Heart", label: "Health" },
  { value: "Book", label: "Book" },
  { value: "Music", label: "Music" },
  { value: "Car", label: "Auto" },
  { value: "Dumbbell", label: "Fitness" },
  { value: "Sparkles", label: "Sparkle" },
  { value: "Grid3X3", label: "Grid" },
]

export const SECTION_TYPES: SectionTypeConfig[] = [
  // ── BASIC ──
  {
    id: "announcement",
    label: "Announcement Bar",
    icon: "Megaphone",
    category: "basic",
    description: "Top announcement bar with message and optional link",
    defaultProps: {
      message: "Free shipping on orders over ৳5000!",
      bgColor: "#000000",
      textColor: "#ffffff",
      dismissible: true,
      link: "",
      linkText: "Shop Now",
    },
    fields: [
      { key: "message", label: "Message", type: "text" },
      { key: "bgColor", label: "Background Color", type: "color" },
      { key: "textColor", label: "Text Color", type: "color" },
      { key: "dismissible", label: "Dismissible", type: "boolean" },
      { key: "link", label: "Link URL", type: "text" },
      { key: "linkText", label: "Link Text", type: "text" },
    ],
  },
  {
    id: "hero",
    label: "Hero Section",
    icon: "Image",
    category: "basic",
    description: "Large hero banner with title, subtitle, and CTA",
    defaultProps: {
      title: "Welcome to Our Store",
      subtitle: "Discover amazing products at great prices",
      ctaText: "Shop Now",
      ctaLink: "/products",
      style: "centered",
      backgroundImage: "",
      features: [],
      stats: [],
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "ctaText", label: "CTA Button Text", type: "text" },
      { key: "ctaLink", label: "CTA Link", type: "text" },
      {
        key: "style",
        label: "Style",
        type: "select",
        options: [
          { value: "centered", label: "Centered" },
          { value: "split", label: "Split" },
          { value: "minimal", label: "Minimal" },
          { value: "video", label: "Video" },
          { value: "parallax", label: "Parallax" },
        ],
      },
      { key: "backgroundImage", label: "Background Image URL", type: "image" },
      {
        key: "features",
        label: "Features",
        type: "list",
        itemFields: [
          { key: "icon", label: "Icon", type: "select", options: ICON_OPTIONS },
          { key: "text", label: "Text", type: "text" },
        ],
        newItemDefault: { icon: "Star", text: "Feature" },
      },
      {
        key: "stats",
        label: "Stats",
        type: "list",
        itemFields: [
          { key: "value", label: "Value", type: "text" },
          { key: "label", label: "Label", type: "text" },
        ],
        newItemDefault: { value: "100+", label: "Products" },
      },
    ],
  },
  {
    id: "banner",
    label: "Banner",
    icon: "PanelTop",
    category: "basic",
    description: "Full-width image/gradient banner with text overlay",
    defaultProps: {
      title: "Special Offer",
      subtitle: "Limited time deal",
      ctaText: "Learn More",
      ctaLink: "",
      backgroundImage: "",
      overlay: true,
      bgColor: "",
      textColor: "light",
      height: "md",
      alignment: "center",
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "ctaText", label: "CTA Text", type: "text" },
      { key: "ctaLink", label: "CTA Link", type: "text" },
      { key: "backgroundImage", label: "Background Image URL", type: "image" },
      { key: "overlay", label: "Dark Overlay", type: "boolean" },
      { key: "bgColor", label: "Background Color (if no image)", type: "color" },
      {
        key: "textColor",
        label: "Text Color",
        type: "select",
        options: [
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ],
      },
      {
        key: "height",
        label: "Height",
        type: "select",
        options: [
          { value: "sm", label: "Small" },
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" },
          { value: "full", label: "Full Screen" },
        ],
      },
      {
        key: "alignment",
        label: "Alignment",
        type: "select",
        options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
        ],
      },
    ],
  },
  {
    id: "cta",
    label: "Call to Action",
    icon: "MousePointerClick",
    category: "basic",
    description: "CTA section with title, description, and button",
    defaultProps: {
      title: "Ready to Get Started?",
      subtitle: "Join thousands of happy customers today.",
      ctaText: "Shop Now",
      ctaLink: "/products",
      style: "centered",
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "ctaText", label: "Button Text", type: "text" },
      { key: "ctaLink", label: "Button Link", type: "text" },
      {
        key: "style",
        label: "Style",
        type: "select",
        options: [
          { value: "centered", label: "Centered" },
          { value: "split", label: "Split" },
          { value: "banner", label: "Banner" },
        ],
      },
    ],
  },
  {
    id: "spacer",
    label: "Spacer",
    icon: "Minus",
    category: "basic",
    description: "Empty spacer to add vertical breathing room",
    defaultProps: { height: 48 },
    fields: [
      { key: "height", label: "Height (px)", type: "number", min: 8, max: 200 },
    ],
  },

  // ── PRODUCTS ──
  {
    id: "collections",
    label: "Collections",
    icon: "Grid3X3",
    category: "products",
    description: "Display store collections in a grid or carousel",
    defaultProps: {
      title: "Shop by Category",
      layout: "grid",
      columns: 3,
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      {
        key: "layout",
        label: "Layout",
        type: "select",
        options: [
          { value: "grid", label: "Grid" },
          { value: "carousel", label: "Carousel" },
          { value: "cards", label: "Cards" },
          { value: "icons", label: "Icons" },
        ],
      },
      {
        key: "columns",
        label: "Columns",
        type: "select",
        options: [
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
        ],
      },
    ],
  },
  {
    id: "featuredProducts",
    label: "Featured Products",
    icon: "Star",
    category: "products",
    description: "Highlight featured products from the store",
    defaultProps: {
      title: "Featured Products",
      layout: "grid",
      limit: 8,
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      {
        key: "layout",
        label: "Layout",
        type: "select",
        options: [
          { value: "grid", label: "Grid" },
          { value: "carousel", label: "Carousel" },
        ],
      },
      { key: "limit", label: "Max Products", type: "number", min: 1, max: 50 },
    ],
  },
  {
    id: "products",
    label: "Products",
    icon: "ShoppingBag",
    category: "products",
    description: "Product listing with filters and sorting",
    defaultProps: {
      title: "All Products",
      layout: "grid",
      limit: 12,
      showFilters: true,
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      {
        key: "layout",
        label: "Layout",
        type: "select",
        options: [
          { value: "grid", label: "Grid" },
          { value: "carousel", label: "Carousel" },
          { value: "list", label: "List" },
        ],
      },
      { key: "limit", label: "Max Products", type: "number", min: 1, max: 50 },
      { key: "showFilters", label: "Show Filters", type: "boolean" },
    ],
  },
  {
    id: "categories",
    label: "Categories",
    icon: "LayoutGrid",
    category: "products",
    description: "Display product categories with images or icons",
    defaultProps: {
      title: "Shop by Category",
      columns: 4,
      style: "cards",
      items: [
        { name: "Electronics", icon: "Laptop" },
        { name: "Fashion", icon: "Shirt" },
        { name: "Home", icon: "Home" },
        { name: "Sports", icon: "Dumbbell" },
      ],
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      {
        key: "columns",
        label: "Columns",
        type: "select",
        options: [
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "5", label: "5" },
          { value: "6", label: "6" },
        ],
      },
      {
        key: "style",
        label: "Style",
        type: "select",
        options: [
          { value: "cards", label: "Cards" },
          { value: "icons", label: "Icons" },
          { value: "grid", label: "Grid" },
          { value: "overlay", label: "Overlay" },
        ],
      },
      {
        key: "items",
        label: "Categories",
        type: "list",
        itemFields: [
          { key: "name", label: "Name", type: "text" },
          { key: "icon", label: "Icon", type: "select", options: ICON_OPTIONS },
          { key: "image", label: "Image URL", type: "image" },
          { key: "description", label: "Description", type: "text" },
        ],
        newItemDefault: { name: "Category", icon: "ShoppingBag", image: "", description: "" },
      },
    ],
  },

  // ── SOCIAL ──
  {
    id: "testimonials",
    label: "Testimonials",
    icon: "Quote",
    category: "social",
    description: "Customer testimonials and reviews",
    defaultProps: {
      title: "What Our Customers Say",
      style: "cards",
      items: [
        { name: "Sarah K.", role: "Verified Buyer", text: "Amazing quality and fast delivery!", rating: 5 },
        { name: "Ahmed R.", role: "Repeat Customer", text: "Best online store in Bangladesh.", rating: 5 },
        { name: "Fatima N.", role: "Verified Buyer", text: "Great prices and excellent service.", rating: 4 },
      ],
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      {
        key: "style",
        label: "Style",
        type: "select",
        options: [
          { value: "cards", label: "Cards" },
          { value: "carousel", label: "Carousel" },
          { value: "minimal", label: "Minimal" },
        ],
      },
      {
        key: "items",
        label: "Testimonials",
        type: "list",
        itemFields: [
          { key: "name", label: "Name", type: "text" },
          { key: "role", label: "Role", type: "text" },
          { key: "text", label: "Quote", type: "textarea" },
          { key: "avatar", label: "Avatar URL", type: "image" },
          { key: "rating", label: "Rating (1-5)", type: "number", min: 1, max: 5 },
        ],
        newItemDefault: { name: "Customer", role: "Buyer", text: "Great experience!", avatar: "", rating: 5 },
      },
    ],
  },
  {
    id: "newsletter",
    label: "Newsletter",
    icon: "Mail",
    category: "social",
    description: "Email subscription signup section",
    defaultProps: {
      title: "Stay Updated",
      subtitle: "Subscribe to get special offers and new arrivals",
      style: "centered",
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      {
        key: "style",
        label: "Style",
        type: "select",
        options: [
          { value: "centered", label: "Centered" },
          { value: "split", label: "Split" },
          { value: "minimal", label: "Minimal" },
        ],
      },
    ],
  },
  {
    id: "brandLogos",
    label: "Brand Logos",
    icon: "Award",
    category: "social",
    description: "Trust badges — display partner or brand logos",
    defaultProps: {
      title: "Trusted By",
      layout: "carousel",
      grayscale: true,
      items: [
        { name: "Brand 1", logo: "" },
        { name: "Brand 2", logo: "" },
        { name: "Brand 3", logo: "" },
        { name: "Brand 4", logo: "" },
      ],
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      {
        key: "layout",
        label: "Layout",
        type: "select",
        options: [
          { value: "carousel", label: "Carousel" },
          { value: "grid", label: "Grid" },
        ],
      },
      { key: "grayscale", label: "Grayscale Filter", type: "boolean" },
      {
        key: "items",
        label: "Brands",
        type: "list",
        itemFields: [
          { key: "name", label: "Brand Name", type: "text" },
          { key: "logo", label: "Logo URL", type: "image" },
        ],
        newItemDefault: { name: "Brand", logo: "" },
      },
    ],
  },
  {
    id: "team",
    label: "Team Members",
    icon: "Users",
    category: "social",
    description: "Showcase team members with photos and roles",
    defaultProps: {
      title: "Our Team",
      columns: 3,
      style: "cards",
      members: [
        { name: "John Doe", role: "CEO", image: "", bio: "Leading the team" },
        { name: "Jane Smith", role: "CTO", image: "", bio: "Building the product" },
        { name: "Bob Wilson", role: "Designer", image: "", bio: "Crafting the experience" },
      ],
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      {
        key: "columns",
        label: "Columns",
        type: "select",
        options: [
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
        ],
      },
      {
        key: "style",
        label: "Style",
        type: "select",
        options: [
          { value: "cards", label: "Cards" },
          { value: "minimal", label: "Minimal" },
          { value: "overlay", label: "Overlay" },
        ],
      },
      {
        key: "members",
        label: "Members",
        type: "list",
        itemFields: [
          { key: "name", label: "Name", type: "text" },
          { key: "role", label: "Role", type: "text" },
          { key: "image", label: "Photo URL", type: "image" },
          { key: "bio", label: "Bio", type: "textarea" },
        ],
        newItemDefault: { name: "Team Member", role: "Role", image: "", bio: "" },
      },
    ],
  },

  // ── ADVANCED ──
  {
    id: "features",
    label: "Features / Trust Badges",
    icon: "ShieldCheck",
    category: "advanced",
    description: "Feature highlights with icons (shipping, security, etc.)",
    defaultProps: {
      title: "Why Choose Us",
      layout: "icons",
      items: [
        { icon: "Truck", title: "Free Shipping", description: "On orders over ৳5000" },
        { icon: "ShieldCheck", title: "Secure Payment", description: "100% secure checkout" },
        { icon: "RefreshCcw", title: "Easy Returns", description: "30-day return policy" },
        { icon: "Headphones", title: "24/7 Support", description: "Always here to help" },
      ],
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      {
        key: "layout",
        label: "Layout",
        type: "select",
        options: [
          { value: "icons", label: "Icons" },
          { value: "cards", label: "Cards" },
        ],
      },
      {
        key: "items",
        label: "Features",
        type: "list",
        itemFields: [
          { key: "icon", label: "Icon", type: "select", options: ICON_OPTIONS },
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ],
        newItemDefault: { icon: "Star", title: "Feature", description: "Description" },
      },
    ],
  },
  {
    id: "stats",
    label: "Statistics",
    icon: "BarChart3",
    category: "advanced",
    description: "Key metrics and statistics display",
    defaultProps: {
      title: "By the Numbers",
      items: [
        { label: "Happy Customers", value: "10,000+", suffix: "" },
        { label: "Products Sold", value: "50,000+", suffix: "" },
        { label: "Cities Served", value: "64", suffix: "+" },
      ],
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      {
        key: "items",
        label: "Stats",
        type: "list",
        itemFields: [
          { key: "label", label: "Label", type: "text" },
          { key: "value", label: "Value", type: "text" },
          { key: "suffix", label: "Suffix", type: "text" },
        ],
        newItemDefault: { label: "Metric", value: "100+", suffix: "" },
      },
    ],
  },
  {
    id: "countdown",
    label: "Countdown Timer",
    icon: "Timer",
    category: "advanced",
    description: "Live countdown timer for sales or events",
    defaultProps: {
      title: "Sale Ends In",
      subtitle: "Don't miss out on our biggest sale!",
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      style: "cards",
      endedMessage: "This sale has ended",
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "targetDate", label: "Target Date (YYYY-MM-DD)", type: "text" },
      {
        key: "style",
        label: "Style",
        type: "select",
        options: [
          { value: "cards", label: "Cards" },
          { value: "inline", label: "Inline" },
          { value: "flip", label: "Flip" },
        ],
      },
      { key: "endedMessage", label: "Ended Message", type: "text" },
    ],
  },
  {
    id: "faq",
    label: "FAQ",
    icon: "HelpCircle",
    category: "advanced",
    description: "Frequently asked questions accordion",
    defaultProps: {
      title: "Frequently Asked Questions",
      style: "accordion",
      items: [
        { question: "How long does shipping take?", answer: "We deliver within 2-5 business days across Bangladesh." },
        { question: "What is your return policy?", answer: "We offer a 30-day return policy for all unused items." },
        { question: "Do you offer Cash on Delivery?", answer: "Yes! COD is available for all orders under ৳50,000." },
      ],
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      {
        key: "style",
        label: "Style",
        type: "select",
        options: [
          { value: "accordion", label: "Accordion" },
          { value: "bordered", label: "Bordered" },
        ],
      },
      {
        key: "items",
        label: "Questions",
        type: "list",
        itemFields: [
          { key: "question", label: "Question", type: "text" },
          { key: "answer", label: "Answer", type: "textarea" },
        ],
        newItemDefault: { question: "Question?", answer: "Answer." },
      },
    ],
  },
  {
    id: "pricing",
    label: "Pricing Plans",
    icon: "CreditCard",
    category: "advanced",
    description: "Pricing comparison table or cards",
    defaultProps: {
      title: "Choose Your Plan",
      columns: 3,
      style: "cards",
      plans: [
        { name: "Basic", price: "৳999", period: "/month", features: ["5 Products", "Basic Support", "Standard Theme"], ctaText: "Get Started", highlighted: false },
        { name: "Pro", price: "৳2,499", period: "/month", features: ["50 Products", "Priority Support", "Custom Theme", "Analytics"], ctaText: "Get Started", highlighted: true },
        { name: "Enterprise", price: "৳9,999", period: "/month", features: ["Unlimited Products", "24/7 Support", "Custom Theme", "Analytics", "API Access"], ctaText: "Contact Us", highlighted: false },
      ],
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      {
        key: "columns",
        label: "Columns",
        type: "select",
        options: [
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
        ],
      },
      {
        key: "style",
        label: "Style",
        type: "select",
        options: [
          { value: "cards", label: "Cards" },
          { value: "table", label: "Table" },
          { value: "minimal", label: "Minimal" },
        ],
      },
      {
        key: "plans",
        label: "Plans",
        type: "list",
        itemFields: [
          { key: "name", label: "Plan Name", type: "text" },
          { key: "price", label: "Price", type: "text" },
          { key: "period", label: "Period", type: "text" },
          { key: "features", label: "Features (one per line)", type: "textarea" },
          { key: "ctaText", label: "CTA Text", type: "text" },
          { key: "ctaLink", label: "CTA Link", type: "text" },
          { key: "highlighted", label: "Highlighted", type: "boolean" },
        ],
        newItemDefault: { name: "Plan", price: "৳0", period: "/month", features: "Feature 1\nFeature 2", ctaText: "Get Started", ctaLink: "", highlighted: false },
      },
    ],
  },
  {
    id: "timeline",
    label: "Timeline / Process",
    icon: "GitBranch",
    category: "advanced",
    description: "Step-by-step process or timeline display",
    defaultProps: {
      title: "How It Works",
      style: "horizontal",
      steps: [
        { title: "Browse", description: "Explore our collection", icon: "ShoppingBag" },
        { title: "Select", description: "Choose your favorites", icon: "Star" },
        { title: "Checkout", description: "Secure payment", icon: "CreditCard" },
        { title: "Delivery", description: "Fast shipping to your door", icon: "Truck" },
      ],
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      {
        key: "style",
        label: "Style",
        type: "select",
        options: [
          { value: "vertical", label: "Vertical" },
          { value: "horizontal", label: "Horizontal" },
          { value: "zigzag", label: "Zigzag" },
        ],
      },
      {
        key: "steps",
        label: "Steps",
        type: "list",
        itemFields: [
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "icon", label: "Icon", type: "select", options: ICON_OPTIONS },
        ],
        newItemDefault: { title: "Step", description: "Description", icon: "Star" },
      },
    ],
  },
  {
    id: "recentlyViewed",
    label: "Recently Viewed",
    icon: "Eye",
    category: "advanced",
    description: "Show recently viewed products",
    defaultProps: { title: "Recently Viewed", limit: 8 },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "limit", label: "Max Products", type: "number", min: 1, max: 20 },
    ],
  },
  // ── PORTFOLIO ──
  {
    id: "projects",
    label: "Projects",
    icon: "Grid3X3",
    category: "portfolio",
    description: "Showcase portfolio projects in a grid or masonry layout",
    defaultProps: { title: "Our Projects", layout: "grid", columns: 3, showFilters: true, items: [{ title: "Project Alpha", category: "Web", image: "", description: "A modern web application" }, { title: "Project Beta", category: "Mobile", image: "", description: "Cross-platform mobile app" }] },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "layout", label: "Layout", type: "select", options: [{ value: "grid", label: "Grid" }, { value: "masonry", label: "Masonry" }, { value: "list", label: "List" }, { value: "carousel", label: "Carousel" }] },
      { key: "columns", label: "Columns", type: "number", min: 1, max: 4 },
      { key: "showFilters", label: "Show Filters", type: "boolean" },
      { key: "items", label: "Projects", type: "list", itemFields: [{ key: "title", label: "Title", type: "text" }, { key: "category", label: "Category", type: "text" }, { key: "image", label: "Image", type: "image" }, { key: "description", label: "Description", type: "textarea" }], newItemDefault: { title: "New Project", category: "Web", image: "", description: "" } },
    ],
  },
  {
    id: "gallery",
    label: "Gallery",
    icon: "Image",
    category: "portfolio",
    description: "Photo gallery with grid, masonry, or lightbox layout",
    defaultProps: { title: "Gallery", layout: "grid", columns: 3, gap: "medium", items: [{ image: "", caption: "Photo 1" }, { image: "", caption: "Photo 2" }] },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "layout", label: "Layout", type: "select", options: [{ value: "grid", label: "Grid" }, { value: "masonry", label: "Masonry" }, { value: "lightbox", label: "Lightbox" }, { value: "carousel", label: "Carousel" }] },
      { key: "columns", label: "Columns", type: "number", min: 1, max: 6 },
      { key: "gap", label: "Gap", type: "select", options: [{ value: "none", label: "None" }, { value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }] },
      { key: "items", label: "Images", type: "list", itemFields: [{ key: "image", label: "Image", type: "image" }, { key: "caption", label: "Caption", type: "text" }], newItemDefault: { image: "", caption: "" } },
    ],
  },
  {
    id: "skills",
    label: "Skills",
    icon: "Zap",
    category: "portfolio",
    description: "Display skills with progress bars, tags, or cards",
    defaultProps: { title: "Skills", layout: "bars", items: [{ name: "React", level: 90 }, { name: "Node.js", level: 85 }, { name: "TypeScript", level: 80 }] },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "layout", label: "Layout", type: "select", options: [{ value: "bars", label: "Progress Bars" }, { value: "tags", label: "Tags" }, { value: "cards", label: "Cards" }, { value: "grid", label: "Grid" }] },
      { key: "items", label: "Skills", type: "list", itemFields: [{ key: "name", label: "Skill Name", type: "text" }, { key: "level", label: "Level (0-100)", type: "number", min: 0, max: 100 }], newItemDefault: { name: "New Skill", level: 50 } },
    ],
  },
  {
    id: "experience",
    label: "Experience",
    icon: "Briefcase",
    category: "portfolio",
    description: "Work experience timeline or cards",
    defaultProps: { title: "Experience", layout: "timeline", items: [{ title: "Senior Developer", company: "Tech Corp", period: "2022 - Present", description: "Led frontend team" }] },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "layout", label: "Layout", type: "select", options: [{ value: "timeline", label: "Timeline" }, { value: "cards", label: "Cards" }, { value: "compact", label: "Compact" }] },
      { key: "items", label: "Positions", type: "list", itemFields: [{ key: "title", label: "Job Title", type: "text" }, { key: "company", label: "Company", type: "text" }, { key: "period", label: "Period", type: "text" }, { key: "description", label: "Description", type: "textarea" }], newItemDefault: { title: "Job Title", company: "Company", period: "2024", description: "" } },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    icon: "Mail",
    category: "portfolio",
    description: "Contact information with optional form and map",
    defaultProps: { title: "Get In Touch", layout: "split", showForm: true, showMap: false, email: "hello@example.com", phone: "+880 1XXX-XXXXXX" },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "layout", label: "Layout", type: "select", options: [{ value: "split", label: "Split" }, { value: "centered", label: "Centered" }, { value: "minimal", label: "Minimal" }] },
      { key: "showForm", label: "Show Form", type: "boolean" },
      { key: "showMap", label: "Show Map", type: "boolean" },
      { key: "email", label: "Email", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
    ],
  },
  {
    id: "about",
    label: "About",
    icon: "User",
    category: "portfolio",
    description: "About section with text and image",
    defaultProps: { title: "About Us", layout: "split", description: "We are a passionate team dedicated to delivering excellence.", image: "" },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "layout", label: "Layout", type: "select", options: [{ value: "split", label: "Split" }, { value: "centered", label: "Centered" }, { value: "image-left", label: "Image Left" }, { value: "image-right", label: "Image Right" }] },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Image", type: "image" },
    ],
  },
  // ── CORPORATE ──
  {
    id: "services",
    label: "Services",
    icon: "Settings",
    category: "corporate",
    description: "Display services in grid, cards, or icon layout",
    defaultProps: { title: "Our Services", layout: "grid", columns: 3, items: [{ title: "Consulting", description: "Expert advice for your business", icon: "Zap" }, { title: "Development", description: "Custom software solutions", icon: "Laptop" }] },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "layout", label: "Layout", type: "select", options: [{ value: "grid", label: "Grid" }, { value: "cards", label: "Cards" }, { value: "icons", label: "Icons" }, { value: "list", label: "List" }] },
      { key: "columns", label: "Columns", type: "number", min: 1, max: 4 },
      { key: "items", label: "Services", type: "list", itemFields: [{ key: "title", label: "Title", type: "text" }, { key: "description", label: "Description", type: "textarea" }, { key: "icon", label: "Icon", type: "select", options: ICON_OPTIONS }], newItemDefault: { title: "New Service", description: "", icon: "Zap" } },
    ],
  },
  {
    id: "clients",
    label: "Clients",
    icon: "Users",
    category: "corporate",
    description: "Client logos or testimonials",
    defaultProps: { title: "Our Clients", layout: "grid", items: [{ name: "Client 1", logo: "" }, { name: "Client 2", logo: "" }] },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "layout", label: "Layout", type: "select", options: [{ value: "grid", label: "Grid" }, { value: "carousel", label: "Carousel" }, { value: "masonry", label: "Masonry" }] },
      { key: "items", label: "Clients", type: "list", itemFields: [{ key: "name", label: "Name", type: "text" }, { key: "logo", label: "Logo", type: "image" }], newItemDefault: { name: "Client", logo: "" } },
    ],
  },
  {
    id: "partners",
    label: "Partners",
    icon: "Handshake",
    category: "corporate",
    description: "Partner logos with optional grayscale effect",
    defaultProps: { title: "Our Partners", layout: "grid", grayscale: true, items: [{ name: "Partner 1", logo: "" }, { name: "Partner 2", logo: "" }] },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "layout", label: "Layout", type: "select", options: [{ value: "grid", label: "Grid" }, { value: "carousel", label: "Carousel" }] },
      { key: "grayscale", label: "Grayscale Logos", type: "boolean" },
      { key: "items", label: "Partners", type: "list", itemFields: [{ key: "name", label: "Name", type: "text" }, { key: "logo", label: "Logo", type: "image" }], newItemDefault: { name: "Partner", logo: "" } },
    ],
  },
  {
    id: "mission",
    label: "Mission & Values",
    icon: "Heart",
    category: "corporate",
    description: "Company mission, vision, and values",
    defaultProps: { title: "Our Mission", layout: "centered", description: "To empower businesses with cutting-edge technology.", values: [{ title: "Innovation", description: "Pushing boundaries" }, { title: "Integrity", description: "Doing the right thing" }] },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "layout", label: "Layout", type: "select", options: [{ value: "centered", label: "Centered" }, { value: "split", label: "Split" }, { value: "cards", label: "Cards" }] },
      { key: "description", label: "Description", type: "textarea" },
      { key: "values", label: "Values", type: "list", itemFields: [{ key: "title", label: "Title", type: "text" }, { key: "description", label: "Description", type: "textarea" }], newItemDefault: { title: "Value", description: "" } },
    ],
  },
  // ── BLOG ──
  {
    id: "blogPosts",
    label: "Blog Posts",
    icon: "FileText",
    category: "blog",
    description: "Display blog posts in grid, list, or featured layout",
    defaultProps: { title: "Latest Posts", layout: "grid", columns: 3, limit: 6 },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "layout", label: "Layout", type: "select", options: [{ value: "grid", label: "Grid" }, { value: "list", label: "List" }, { value: "featured", label: "Featured" }, { value: "masonry", label: "Masonry" }] },
      { key: "columns", label: "Columns", type: "number", min: 1, max: 4 },
      { key: "limit", label: "Max Posts", type: "number", min: 1, max: 20 },
    ],
  },
  {
    id: "featuredPost",
    label: "Featured Post",
    icon: "Star",
    category: "blog",
    description: "Highlight a single featured blog post",
    defaultProps: { layout: "hero", title: "Featured Article", excerpt: "Discover insights and trends in our latest article.", image: "" },
    fields: [
      { key: "layout", label: "Layout", type: "select", options: [{ value: "hero", label: "Hero" }, { value: "split", label: "Split" }, { value: "card", label: "Card" }] },
      { key: "title", label: "Title", type: "text" },
      { key: "excerpt", label: "Excerpt", type: "textarea" },
      { key: "image", label: "Image", type: "image" },
    ],
  },
  // ── RESTAURANT ──
  {
    id: "menu",
    label: "Menu",
    icon: "Utensils",
    category: "restaurant",
    description: "Restaurant menu with categories and items",
    defaultProps: { title: "Our Menu", layout: "cards", categories: [{ name: "Starters", items: [{ name: "Spring Rolls", price: "৳120", description: "Crispy vegetable rolls" }] }, { name: "Main Course", items: [{ name: "Chicken Biryani", price: "৳280", description: "Aromatic basmati rice" }] }] },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "layout", label: "Layout", type: "select", options: [{ value: "cards", label: "Cards" }, { value: "list", label: "List" }, { value: "tabs", label: "Tabs" }, { value: "grid", label: "Grid" }] },
    ],
  },
  {
    id: "hours",
    label: "Opening Hours",
    icon: "Clock",
    category: "restaurant",
    description: "Display business opening hours",
    defaultProps: { title: "Opening Hours", layout: "table", schedule: [{ day: "Saturday - Thursday", time: "10:00 AM - 10:00 PM" }, { day: "Friday", time: "2:00 PM - 10:00 PM" }] },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "layout", label: "Layout", type: "select", options: [{ value: "table", label: "Table" }, { value: "cards", label: "Cards" }, { value: "minimal", label: "Minimal" }] },
    ],
  },
  {
    id: "reservation",
    label: "Reservation",
    icon: "Calendar",
    category: "restaurant",
    description: "Table reservation form",
    defaultProps: { title: "Reserve a Table", layout: "form", subtitle: "Book your dining experience" },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "layout", label: "Layout", type: "select", options: [{ value: "form", label: "Form" }, { value: "split", label: "Split" }, { value: "card", label: "Card" }] },
      { key: "subtitle", label: "Subtitle", type: "text" },
    ],
  },
  // ── EDUCATION ──
  {
    id: "courses",
    label: "Courses",
    icon: "Book",
    category: "education",
    description: "Display courses or programs",
    defaultProps: { title: "Our Courses", layout: "grid", columns: 3, items: [{ title: "Web Development", description: "Learn modern web development", level: "Beginner", duration: "12 weeks", price: "৳5,000" }, { title: "Data Science", description: "Master data analysis", level: "Intermediate", duration: "16 weeks", price: "৳8,000" }] },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "layout", label: "Layout", type: "select", options: [{ value: "grid", label: "Grid" }, { value: "list", label: "List" }, { value: "cards", label: "Cards" }] },
      { key: "columns", label: "Columns", type: "number", min: 1, max: 4 },
      { key: "items", label: "Courses", type: "list", itemFields: [{ key: "title", label: "Title", type: "text" }, { key: "description", label: "Description", type: "textarea" }, { key: "level", label: "Level", type: "select", options: [{ value: "Beginner", label: "Beginner" }, { value: "Intermediate", label: "Intermediate" }, { value: "Advanced", label: "Advanced" }] }, { key: "duration", label: "Duration", type: "text" }, { key: "price", label: "Price", type: "text" }], newItemDefault: { title: "New Course", description: "", level: "Beginner", duration: "", price: "" } },
    ],
  },
]

export function getSectionTypeConfig(type: string): SectionTypeConfig | undefined {
  return SECTION_TYPES.find((s) => s.id === type)
}

export function getSectionDefaults(type: string): Record<string, any> {
  const config = getSectionTypeConfig(type)
  return config ? JSON.parse(JSON.stringify(config.defaultProps)) : {}
}

export function getSectionFields(type: string): FieldDef[] {
  const config = getSectionTypeConfig(type)
  return config?.fields || []
}

export function createNewSection(type: string): HomeSectionConfig {
  return {
    type: type as any,
    props: getSectionDefaults(type),
  }
}
