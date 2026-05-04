import type { TemplateConfig } from "./types"

/**
 * Sample template configurations that demonstrate the full schema.
 * These can be used as starting points for template uploads.
 */
export const sampleConfigs: Record<string, TemplateConfig> = {
  "minimal-dark": {
    id: "minimal-dark",
    name: "Minimal Dark",
    tagline: "Sleek & Modern",
    description: "A dark-themed minimal template perfect for tech and electronics stores",
    version: "1.0.0",
    category: "electronics",
    isPremium: false,

    colors: {
      primary: "#6366f1",
      secondary: "#818cf8",
      accent: "#c7d2fe",
      background: "#0f172a",
      surface: "#1e293b",
      text: "#f1f5f9",
      textMuted: "#94a3b8",
      border: "#334155",
      success: "#22c55e",
      error: "#ef4444",
    },

    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: "700",
      borderRadius: "lg",
    },

    layout: {
      maxWidth: "7xl",
      sectionSpacing: "normal",
      cardStyle: "bordered",
            productColumns: 4,
    },

    navbar: {
      style: "sticky-dark",
      showSearch: true,
      showWishlist: true,
      showUserMenu: true,
      layout: "left-aligned",
      announcementBar: {
        message: "🚀 Free shipping on orders over ৳5,000",
        bgColor: "#4f46e5",
        textColor: "#ffffff",
      },
    },

    footer: {
      style: "dark",
      showNewsletter: true,
      showSocial: true,
      columns: 4,
    },

    homePage: {
      sections: [
        {
          type: "announcement",
          props: {
            message: "🚀 Free shipping on orders over ৳5,000",
            bgColor: "#4f46e5",
            textColor: "#ffffff",
          },
        },
        {
          type: "hero",
          props: {
            style: "centered",
            title: "Next-Gen Electronics",
            subtitle: "Discover the latest in technology with unbeatable prices and fast delivery across Bangladesh",
            ctaText: "Shop Now",
            ctaLink: "/products",
            showStats: true,
            stats: [
              { label: "Products", value: "500+" },
              { label: "Customers", value: "10K+" },
              { label: "Reviews", value: "4.8★" },
            ],
            showFeatures: true,
            features: [
              { icon: "Truck", title: "Fast Delivery", description: "Nationwide shipping" },
              { icon: "ShieldCheck", title: "Warranty", description: "Official warranty" },
              { icon: "RefreshCcw", title: "Easy Returns", description: "7-day return policy" },
            ],
          },
        },
        {
          type: "collections",
          props: {
            layout: "grid",
            columns: 4,
            showAll: true,
            title: "Shop by Category",
          },
        },
        {
          type: "featuredProducts",
          props: {
            layout: "grid",
            columns: 4,
            limit: 8,
            title: "Featured Products",
            showQuickAdd: true,
          },
        },
        {
          type: "features",
          props: {
            layout: "grid",
            items: [
              { icon: "Truck", title: "Free Shipping", description: "On orders over ৳5,000" },
              { icon: "ShieldCheck", title: "Secure Payment", description: "100% secure checkout" },
              { icon: "RefreshCcw", title: "Easy Returns", description: "7-day return policy" },
              { icon: "Star", title: "Top Quality", description: "Verified products only" },
            ],
            style: "minimal",
          },
        },
        {
          type: "products",
          props: {
            layout: "grid",
            columns: 4,
            showFilters: true,
            showSearch: true,
            title: "All Products",
          },
        },
        {
          type: "newsletter",
          props: {
            title: "Stay Updated",
            subtitle: "Get the latest deals and new arrivals directly in your inbox",
            style: "card",
          },
        },
      ],
    },

    productPage: {
      imageLayout: "stacked",
      showReviews: true,
      showRecentlyViewed: true,
      showRelatedProducts: true,
      showWishlist: true,
      showFeatures: true,
      features: [
        { icon: "Truck", title: "Free Shipping", description: "On orders over ৳5,000" },
        { icon: "ShieldCheck", title: "Official Warranty", description: "Manufacturer warranty included" },
        { icon: "RefreshCcw", title: "Easy Returns", description: "7-day return policy" },
      ],
    },

    collectionPage: {
      showFilters: true,
      gridColumns: 4,
      cardStyle: "standard",
    },
  },

  "fashion-boutique": {
    id: "fashion-boutique",
    name: "Fashion Boutique",
    tagline: "Elegant & Stylish",
    description: "A chic fashion template with soft colors and elegant typography",
    version: "1.0.0",
    category: "fashion",
    isPremium: false,

    colors: {
      primary: "#be9f7e",
      secondary: "#1a1a1a",
      accent: "#f8f6f3",
      background: "#ffffff",
      surface: "#f8f6f3",
      text: "#1a1a1a",
      textMuted: "#6b7280",
      border: "#e5e7eb",
      success: "#22c55e",
      error: "#ef4444",
    },

    typography: {
      headingFont: "Playfair Display",
      bodyFont: "Inter",
      headingWeight: "600",
      borderRadius: "xl",
    },

    layout: {
      maxWidth: "7xl",
      sectionSpacing: "spacious",
      cardStyle: "bordered",
            productColumns: 4,
    },

    navbar: {
      style: "sticky-blur",
      showSearch: true,
      showWishlist: true,
      showUserMenu: true,
      layout: "centered",
      announcementBar: {
        message: "✨ New Collection — Get 20% off your first order",
        bgColor: "#1a1a1a",
        textColor: "#ffffff",
      },
    },

    footer: {
      style: "dark",
      showNewsletter: true,
      showSocial: true,
      columns: 3,
    },

    homePage: {
      sections: [
        {
          type: "hero",
          props: {
            style: "split",
            title: "Timeless Elegance",
            subtitle: "Discover our curated collection of premium fashion essentials",
            ctaText: "Explore Collection",
            ctaLink: "/collections",
            showStats: true,
            stats: [
              { label: "Brands", value: "50+" },
              { label: "Styles", value: "2,000+" },
              { label: "Happy Clients", value: "15K+" },
            ],
            showFeatures: true,
            features: [
              { icon: "Truck", title: "Express Delivery", description: "2-3 days nationwide" },
              { icon: "RefreshCcw", title: "Easy Exchange", description: "14-day exchange policy" },
              { icon: "ShieldCheck", title: "Authentic", description: "100% genuine products" },
            ],
          },
        },
        {
          type: "collections",
          props: {
            layout: "grid",
            columns: 3,
            showAll: true,
            title: "Shop by Category",
          },
        },
        {
          type: "featuredProducts",
          props: {
            layout: "grid",
            columns: 4,
            limit: 8,
            title: "Trending Now",
            showQuickAdd: true,
          },
        },
        {
          type: "testimonials",
          props: {
            style: "cards",
            limit: 3,
          },
        },
        {
          type: "products",
          props: {
            layout: "grid",
            columns: 4,
            showFilters: true,
            showSearch: false,
            title: "New Arrivals",
          },
        },
        {
          type: "newsletter",
          props: {
            title: "Join the Club",
            subtitle: "Subscribe for exclusive offers and style tips",
            style: "fullwidth",
          },
        },
      ],
    },

    productPage: {
      imageLayout: "grid",
      showReviews: true,
      showRecentlyViewed: true,
      showRelatedProducts: true,
      showWishlist: true,
      showFeatures: true,
      features: [
        { icon: "Truck", title: "Express Delivery", description: "2-3 days nationwide" },
        { icon: "RefreshCcw", title: "Easy Exchange", description: "14-day exchange policy" },
        { icon: "ShieldCheck", title: "Authentic", description: "100% genuine products" },
      ],
    },

    collectionPage: {
      showFilters: true,
      gridColumns: 4,
      cardStyle: "overlay",
    },
  },

  "grocery-fresh": {
    id: "grocery-fresh",
    name: "Grocery Fresh",
    tagline: "Fresh & Fast",
    description: "A vibrant grocery template with fresh colors and quick-order features",
    version: "1.0.0",
    category: "grocery",
    isPremium: false,

    colors: {
      primary: "#16a34a",
      secondary: "#f97316",
      accent: "#dcfce7",
      background: "#ffffff",
      surface: "#f0fdf4",
      text: "#14532d",
      textMuted: "#6b7280",
      border: "#d1d5db",
      success: "#22c55e",
      error: "#ef4444",
    },

    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: "800",
      borderRadius: "2xl",
    },

    layout: {
      maxWidth: "7xl",
      sectionSpacing: "compact",
      cardStyle: "shadowed",
      productColumns: 4,
    },

    navbar: {
      style: "sticky-white",
      showSearch: true,
      showWishlist: false,
      showUserMenu: true,
      layout: "left-aligned",
      announcementBar: {
        message: "🥬 Fresh groceries delivered in 30 minutes!",
        bgColor: "#16a34a",
        textColor: "#ffffff",
      },
    },

    footer: {
      style: "light",
      showNewsletter: true,
      showSocial: true,
      columns: 4,
    },

    homePage: {
      sections: [
        {
          type: "hero",
          props: {
            style: "fullwidth",
            title: "Fresh to Your Door",
            subtitle: "Quality groceries and daily essentials delivered fast",
            ctaText: "Order Now",
            ctaLink: "/products",
            showStats: true,
            stats: [
              { label: "Products", value: "1,000+" },
              { label: "Delivery", value: "30 min" },
              { label: "Savings", value: "20%" },
            ],
            minHeight: "60vh",
          },
        },
        {
          type: "collections",
          props: {
            layout: "grid",
            columns: 4,
            showAll: true,
            title: "Shop by Category",
            limit: 8,
          },
        },
        {
          type: "featuredProducts",
          props: {
            layout: "grid",
            columns: 4,
            limit: 8,
            title: "Best Sellers",
            showQuickAdd: true,
          },
        },
        {
          type: "features",
          props: {
            layout: "cards",
            items: [
              { icon: "Truck", title: "30-Min Delivery", description: "Lightning-fast grocery delivery" },
              { icon: "ShieldCheck", title: "Fresh Guarantee", description: "100% freshness guaranteed" },
              { icon: "Star", title: "Best Prices", description: "Competitive prices every day" },
            ],
            style: "colored",
          },
        },
        {
          type: "products",
          props: {
            layout: "grid",
            columns: 4,
            showFilters: true,
            showSearch: true,
            title: "All Products",
          },
        },
        {
          type: "cta",
          props: {
            title: "Download Our App",
            subtitle: "Order groceries on the go with our mobile app",
            buttonText: "Get the App",
            style: "centered",
          },
        },
      ],
    },

    productPage: {
      imageLayout: "stacked",
      showReviews: true,
      showRecentlyViewed: true,
      showRelatedProducts: true,
      showWishlist: false,
      showFeatures: true,
      features: [
        { icon: "Truck", title: "Fast Delivery", description: "30-min grocery delivery" },
        { icon: "ShieldCheck", title: "Fresh Guarantee", description: "100% freshness guaranteed" },
        { icon: "RefreshCcw", title: "Easy Returns", description: "Hassle-free returns" },
      ],
    },

    collectionPage: {
      showFilters: true,
      gridColumns: 4,
      cardStyle: "standard",
    },
  },

  "salon-beauty": {
    id: "salon-beauty",
    name: "Salon & Beauty",
    tagline: "Beauty at your doorstep",
    description: "A professional salon template with service menu, booking calendar, stylist profiles, and price list",
    version: "1.0.0",
    category: "salon",
    isPremium: false,
    colors: {
      primary: "#d946ef",
      secondary: "#c026d3",
      accent: "#fdf4ff",
      background: "#ffffff",
      surface: "#fdf4ff",
      text: "#4a044e",
      textMuted: "#6b7280",
      border: "#e9d5ff",
      success: "#22c55e",
      error: "#ef4444",
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: "700",
      borderRadius: "xl",
    },
    layout: {
      maxWidth: "7xl",
      sectionSpacing: "normal",
      cardStyle: "shadowed",
      productColumns: 4,
    },
    navbar: {
      style: "sticky-blur",
      showSearch: false,
      showWishlist: false,
      showUserMenu: true,
      layout: "centered",
      announcementBar: {
        message: "💇‍♀️ Book your appointment online — 10% off first visit",
        bgColor: "#d946ef",
        textColor: "#ffffff",
      },
    },
    footer: {
      style: "light",
      showNewsletter: true,
      showSocial: true,
      columns: 3,
    },
    homePage: {
      sections: [
        {
          type: "hero",
          props: {
            style: "fullwidth",
            title: "Look & Feel Beautiful",
            subtitle: "Premium salon services delivered to your door. Book online, sit back, and let us handle the rest.",
            ctaText: "Book Appointment",
            ctaLink: "/collections",
            showStats: true,
            stats: [
              { label: "Services", value: "50+" },
              { label: "Stylists", value: "15" },
              { label: "Clients", value: "5K+" },
            ],
            minHeight: "60vh",
          },
        },
        {
          type: "features",
          props: {
            layout: "cards",
            items: [
              { icon: "Scissors", title: "Expert Stylists", description: "Certified professionals with years of experience" },
              { icon: "Home", title: "At-Home Service", description: "Get salon quality at your doorstep" },
              { icon: "Calendar", title: "Easy Booking", description: "Book online in under 2 minutes" },
              { icon: "Tag", title: "Affordable Prices", description: "Premium service at competitive rates" },
            ],
            style: "colored",
          },
        },
        {
          type: "categories",
          props: {
            title: "Our Services",
            items: [
              { name: "Haircut", icon: "Scissors", description: "From ৳500" },
              { name: "Facial", icon: "Sparkles", description: "From ৳800" },
              { name: "Manicure", icon: "Hand", description: "From ৳400" },
              { name: "Makeup", icon: "Palette", description: "From ৳1,500" },
              { name: "Massage", icon: "Heart", description: "From ৳1,200" },
              { name: "Bridal", icon: "Crown", description: "From ৳15,000" },
            ],
            columns: 3,
            style: "cards",
          },
        },
        {
          type: "testimonials",
          props: {
            style: "cards",
            limit: 3,
          },
        },
        {
          type: "cta",
          props: {
            title: "Ready to Glow?",
            subtitle: "Book your first appointment and get 10% off",
            buttonText: "Book Now",
            style: "centered",
          },
        },
      ],
    },
    productPage: {
      imageLayout: "stacked",
      showReviews: true,
      showRecentlyViewed: true,
      showRelatedProducts: true,
      showWishlist: false,
      showFeatures: true,
      features: [
        { icon: "ShieldCheck", title: "100% Satisfaction", description: "Money-back guarantee" },
        { icon: "Leaf", title: "Organic Products", description: "Premium quality products" },
        { icon: "Clock", title: "On Time", description: "Always punctual" },
      ],
    },
    collectionPage: {
      showFilters: true,
      gridColumns: 4,
      cardStyle: "standard",
    },
  },

  "tuition-education": {
    id: "tuition-education",
    name: "Tuition & Education",
    tagline: "Learn. Grow. Excel.",
    description: "An education template with course listings, instructor profiles, batch schedules, and enrollment",
    version: "1.0.0",
    category: "tuition",
    isPremium: false,
    colors: {
      primary: "#1e40af",
      secondary: "#3b82f6",
      accent: "#eff6ff",
      background: "#ffffff",
      surface: "#eff6ff",
      text: "#1e3a5f",
      textMuted: "#6b7280",
      border: "#bfdbfe",
      success: "#22c55e",
      error: "#ef4444",
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: "800",
      borderRadius: "lg",
    },
    layout: {
      maxWidth: "7xl",
      sectionSpacing: "normal",
      cardStyle: "bordered",
            productColumns: 4,
    },
    navbar: {
      style: "sticky-white",
      showSearch: true,
      showWishlist: false,
      showUserMenu: true,
      layout: "left-aligned",
      announcementBar: {
        message: "📚 New batches starting next month — enroll now and save 20%",
        bgColor: "#1e40af",
        textColor: "#ffffff",
      },
    },
    footer: {
      style: "dark",
      showNewsletter: true,
      showSocial: true,
      columns: 4,
    },
    homePage: {
      sections: [
        {
          type: "hero",
          props: {
            style: "split",
            title: "Unlock Your Potential",
            subtitle: "Expert tutoring from Bangladesh's best instructors. From SSC to university, we've got you covered.",
            ctaText: "Find a Course",
            ctaLink: "/collections",
            showStats: true,
            stats: [
              { label: "Courses", value: "200+" },
              { label: "Instructors", value: "50+" },
              { label: "Students", value: "15K+" },
              { label: "Success Rate", value: "98%" },
            ],
          },
        },
        {
          type: "categories",
          props: {
            title: "Subjects We Cover",
            items: [
              { name: "Mathematics", icon: "Calculator" },
              { name: "Physics", icon: "Atom" },
              { name: "Chemistry", icon: "Flask" },
              { name: "Biology", icon: "Dna" },
              { name: "English", icon: "Languages" },
              { name: "ICT", icon: "Laptop" },
              { name: "Bangla", icon: "BookOpen" },
              { name: "Accounting", icon: "FileText" },
            ],
            columns: 4,
            style: "icons",
          },
        },
        {
          type: "team",
          props: {
            title: "Our Star Instructors",
            members: [
              { name: "Dr. Rahman", role: "Mathematics Expert", bio: "10+ years of teaching experience" },
              { name: "Ms. Akhter", role: "Physics Expert", bio: "BUET graduate, passionate educator" },
              { name: "Mr. Hasan", role: "English Expert", bio: "IELTS 8.5 band, creative writing coach" },
            ],
            columns: 3,
            style: "cards",
          },
        },
        {
          type: "testimonials",
          props: {
            style: "carousel",
            limit: 5,
          },
        },
        {
          type: "faq",
          props: {
            title: "Frequently Asked Questions",
            items: [
              { question: "How do I enroll?", answer: "Simply browse our courses, pick one, and click 'Enroll Now'." },
              { question: "Are classes online or in-person?", answer: "We offer both online and in-person classes across Dhaka." },
              { question: "What's the refund policy?", answer: "Full refund before the first class. Partial refund after 2 classes." },
            ],
            style: "accordion",
          },
        },
        {
          type: "cta",
          props: {
            title: "Start Your Learning Journey",
            subtitle: "First lesson free — no commitment required",
            buttonText: "Try Free Lesson",
            style: "banner",
          },
        },
      ],
    },
    productPage: {
      imageLayout: "stacked",
      showReviews: true,
      showRecentlyViewed: false,
      showRelatedProducts: true,
      showWishlist: false,
      showFeatures: true,
      features: [
        { icon: "User", title: "Expert Instructor", description: "Learn from the best" },
        { icon: "Truck", title: "Study Materials", description: "Free notes & resources" },
        { icon: "RefreshCcw", title: "Flexible Schedule", description: "Reschedule any time" },
      ],
    },
    collectionPage: {
      showFilters: true,
      gridColumns: 3,
      cardStyle: "standard",
    },
  },

  "clinic-healthcare": {
    id: "clinic-healthcare",
    name: "Clinic & Healthcare",
    tagline: "Your Health Matters",
    description: "A healthcare template for clinics with doctor profiles, appointment booking, service listings, and timing",
    version: "1.0.0",
    category: "clinic",
    isPremium: false,
    colors: {
      primary: "#059669",
      secondary: "#10b981",
      accent: "#f0fdf4",
      background: "#ffffff",
      surface: "#f0fdf4",
      text: "#065f46",
      textMuted: "#6b7280",
      border: "#a7f3d0",
      success: "#22c55e",
      error: "#ef4444",
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: "700",
      borderRadius: "2xl",
    },
    layout: {
      maxWidth: "7xl",
      sectionSpacing: "normal",
      cardStyle: "bordered",
            productColumns: 4,
    },
    navbar: {
      style: "sticky-white",
      showSearch: false,
      showWishlist: false,
      showUserMenu: true,
      layout: "centered",
      announcementBar: {
        message: "🏥 24/7 emergency service available — call +8801700000000",
        bgColor: "#059669",
        textColor: "#ffffff",
      },
    },
    footer: {
      style: "dark",
      showNewsletter: false,
      showSocial: true,
      columns: 3,
    },
    homePage: {
      sections: [
        {
          type: "hero",
          props: {
            style: "centered",
            title: "Your Family's Health, Our Priority",
            subtitle: "Trusted healthcare with experienced doctors. Book appointments online or visit our clinic.",
            ctaText: "Book Appointment",
            ctaLink: "/collections",
            showStats: true,
            stats: [
              { label: "Doctors", value: "25+" },
              { label: "Specialties", value: "12" },
              { label: "Patients", value: "20K+" },
              { label: "Rating", value: "4.9★" },
            ],
          },
        },
        {
          type: "features",
          props: {
            layout: "cards",
            items: [
              { icon: "Stethoscope", title: "Expert Doctors", description: "Board-certified physicians" },
              { icon: "Clock", title: "Online Booking", description: "Book appointments 24/7" },
              { icon: "Ambulance", title: "Emergency 24/7", description: "Always available for emergencies" },
              { icon: "ShieldCheck", title: "Affordable Care", description: "Quality care at fair prices" },
            ],
            style: "colored",
          },
        },
        {
          type: "categories",
          props: {
            title: "Our Specialties",
            items: [
              { name: "General Medicine" },
              { name: "Pediatrics" },
              { name: "Cardiology" },
              { name: "Dermatology" },
              { name: "Orthopedics" },
              { name: "Dental" },
              { name: "Eye Care" },
              { name: "ENT" },
              { name: "Gynecology" },
              { name: "Neurology" },
            ],
            columns: 5,
            style: "cards",
          },
        },
        {
          type: "banner",
          props: {
            title: "Walk-In Hours",
            subtitle: "Open daily 8AM-10PM. Emergency 24 hours.",
            bgColor: "#059669",
            textColor: "light",
            height: "md",
            alignment: "center",
          },
        },
        {
          type: "cta",
          props: {
            title: "Need a Checkup?",
            subtitle: "Visit us or book an appointment online",
            buttonText: "Book Now",
            style: "centered",
          },
        },
      ],
    },
    productPage: {
      imageLayout: "stacked",
      showReviews: true,
      showRecentlyViewed: false,
      showRelatedProducts: true,
      showWishlist: false,
      showFeatures: true,
      features: [
        { icon: "CreditCard", title: "Insurance Accepted", description: "Major insurance plans" },
        { icon: "Truck", title: "Home Visits", description: "Available on request" },
        { icon: "RefreshCcw", title: "Easy Rescheduling", description: "Change anytime" },
      ],
    },
    collectionPage: {
      showFilters: false,
      gridColumns: 3,
      cardStyle: "standard",
    },
  },

  "pharmacy-store": {
    id: "pharmacy-store",
    name: "Pharmacy",
    tagline: "Medicines Delivered",
    description: "A pharmacy template with medicine catalog, prescription upload, delivery zones, and health articles",
    version: "1.0.0",
    category: "pharmacy",
    isPremium: false,
    colors: {
      primary: "#dc2626",
      secondary: "#ef4444",
      accent: "#fef2f2",
      background: "#ffffff",
      surface: "#fef2f2",
      text: "#450a0a",
      textMuted: "#6b7280",
      border: "#fecaca",
      success: "#22c55e",
      error: "#ef4444",
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: "700",
      borderRadius: "xl",
    },
    layout: {
      maxWidth: "7xl",
      sectionSpacing: "compact",
      cardStyle: "bordered",
            productColumns: 4,
    },
    navbar: {
      style: "sticky-white",
      showSearch: true,
      showWishlist: false,
      showUserMenu: true,
      layout: "left-aligned",
      announcementBar: {
        message: "💊 Upload your prescription — get medicines delivered to your door",
        bgColor: "#dc2626",
        textColor: "#ffffff",
      },
    },
    footer: {
      style: "dark",
      showNewsletter: true,
      showSocial: true,
      columns: 4,
    },
    homePage: {
      sections: [
        {
          type: "hero",
          props: {
            style: "fullwidth",
            title: "Your Health, Delivered",
            subtitle: "Order medicines online with prescription upload. Fast delivery across Dhaka and major cities.",
            ctaText: "Upload Prescription",
            ctaLink: "/collections",
            minHeight: "50vh",
          },
        },
        {
          type: "categories",
          props: {
            title: "Shop by Category",
            items: [
              { name: "Prescription", icon: "Pill" },
              { name: "OTC Medicines", icon: "Shield" },
              { name: "Baby Care", icon: "Baby" },
              { name: "Vitamins", icon: "Zap" },
              { name: "First Aid", icon: "Heart" },
              { name: "Diabetes Care", icon: "Activity" },
              { name: "Skin Care", icon: "Droplet" },
              { name: "Ayurvedic", icon: "Flame" },
            ],
            columns: 4,
            style: "cards",
          },
        },
        {
          type: "features",
          props: {
            layout: "grid",
            items: [
              { icon: "Truck", title: "Fast Delivery", description: "Within 2-4 hours in Dhaka" },
              { icon: "ShieldCheck", title: "100% Genuine", description: "Certified medicines only" },
              { icon: "Phone", title: "Pharmacist Available", description: "Chat with a licensed pharmacist" },
              { icon: "Lock", title: "Secure Checkout", description: "Your data is always protected" },
            ],
            style: "minimal",
          },
        },
        {
          type: "cta",
          props: {
            title: "Prescription Ready?",
            subtitle: "Upload now and get your medicines delivered in hours",
            buttonText: "Upload Rx",
            style: "split",
          },
        },
      ],
    },
    productPage: {
      imageLayout: "stacked",
      showReviews: false,
      showRecentlyViewed: true,
      showRelatedProducts: true,
      showWishlist: false,
      showFeatures: true,
      features: [
        { icon: "ShieldCheck", title: "FDA Approved", description: "Quality assurance guaranteed" },
        { icon: "Truck", title: "Express Delivery", description: "2-4 hour delivery" },
        { icon: "RefreshCcw", title: "Easy Returns", description: "Hassle-free returns" },
      ],
    },
    collectionPage: {
      showFilters: true,
      gridColumns: 4,
      cardStyle: "standard",
    },
  },

  "corporate-services": {
    id: "corporate-services",
    name: "Corporate",
    tagline: "Business Excellence",
    description: "A professional corporate template with service portfolio, team section, case studies, and contact form",
    version: "1.0.0",
    category: "corporate",
    isPremium: true,
    colors: {
      primary: "#1e293b",
      secondary: "#334155",
      accent: "#f8fafc",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#0f172a",
      textMuted: "#64748b",
      border: "#cbd5e1",
      success: "#22c55e",
      error: "#ef4444",
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: "700",
      borderRadius: "md",
    },
    layout: {
      maxWidth: "7xl",
      sectionSpacing: "spacious",
      cardStyle: "bordered",
            productColumns: 4,
    },
    navbar: {
      style: "sticky-white",
      showSearch: false,
      showWishlist: false,
      showUserMenu: true,
      layout: "left-aligned",
    },
    footer: {
      style: "dark",
      showNewsletter: true,
      showSocial: true,
      columns: 4,
    },
    homePage: {
      sections: [
        {
          type: "hero",
          props: {
            style: "split",
            title: "Enterprise Solutions",
            subtitle: "Digital transformation, technology consulting, and enterprise solutions for growing businesses in Bangladesh.",
            ctaText: "Explore Services",
            ctaLink: "/collections",
            showFeatures: true,
            features: [
              { icon: "Code", title: "DevOps", description: "CI/CD pipeline setup" },
              { icon: "Cloud", title: "Cloud", description: "AWS/GCP migrations" },
              { icon: "Shield", title: "Security", description: "Enterprise security audits" },
            ],
          },
        },
        {
          type: "categories",
          props: {
            title: "Our Services",
            items: [
              { name: "Consulting", icon: "Briefcase" },
              { name: "Development", icon: "Code" },
              { name: "Cloud", icon: "Cloud" },
              { name: "AI/ML", icon: "Brain" },
              { name: "Support", icon: "Headset" },
              { name: "Training", icon: "GraduationCap" },
            ],
            columns: 3,
            style: "cards",
          },
        },
        {
          type: "stats",
          props: {
            items: [
              { label: "Projects", value: "500+" },
              { label: "Clients", value: "50+" },
              { label: "Team", value: "200+" },
              { label: "Countries", value: "12" },
            ],
            style: "animated",
          },
        },
        {
          type: "timeline",
          props: {
            title: "Our Process",
            steps: [
              { title: "Discovery", description: "Understanding your business needs" },
              { title: "Design", description: "Architecture & solution design" },
              { title: "Build", description: "Agile development & testing" },
              { title: "Launch", description: "Deployment & go-live support" },
            ],
            style: "horizontal",
          },
        },
        {
          type: "testimonials",
          props: {
            style: "carousel",
            limit: 3,
          },
        },
        {
          type: "cta",
          props: {
            title: "Ready to Transform?",
            subtitle: "Let's discuss how we can help your business grow",
            buttonText: "Contact Us",
            style: "centered",
          },
        },
      ],
    },
    productPage: {
      imageLayout: "stacked",
      showReviews: true,
      showRecentlyViewed: false,
      showRelatedProducts: true,
      showWishlist: false,
      showFeatures: true,
    },
    collectionPage: {
      showFilters: true,
      gridColumns: 3,
      cardStyle: "standard",
    },
  },

  "portfolio-creative": {
    id: "portfolio-creative",
    name: "Portfolio",
    tagline: "Showcase Your Work",
    description: "A creative portfolio template with project gallery, about section, skills showcase, and contact form",
    version: "1.0.0",
    category: "portfolio",
    isPremium: false,
    colors: {
      primary: "#7c3aed",
      secondary: "#a855f7",
      accent: "#faf5ff",
      background: "#ffffff",
      surface: "#faf5ff",
      text: "#2e1065",
      textMuted: "#6b7280",
      border: "#d8b4fe",
      success: "#22c55e",
      error: "#ef4444",
    },
    typography: {
      headingFont: "Poppins",
      bodyFont: "Inter",
      headingWeight: "600",
      borderRadius: "2xl",
    },
    layout: {
      maxWidth: "7xl",
      sectionSpacing: "spacious",
      cardStyle: "bordered",
            productColumns: 3,
    },
    navbar: {
      style: "sticky-blur",
      showSearch: false,
      showWishlist: false,
      showUserMenu: true,
      layout: "centered",
    },
    footer: {
      style: "minimal",
      showNewsletter: false,
      showSocial: true,
      columns: 2,
    },
    homePage: {
      sections: [
        {
          type: "hero",
          props: {
            style: "minimal",
            title: "Hi, I'm [Your Name]",
            subtitle: "Creative professional specializing in design, photography, and digital art. Based in Dhaka, Bangladesh.",
            ctaText: "View Work",
            ctaLink: "/collections",
          },
        },
        {
          type: "categories",
          props: {
            title: "My Work",
            items: [
              { name: "Photography", description: "Portrait & landscape" },
              { name: "Design", description: "UI/UX & graphic" },
              { name: "Video", description: "Editing & motion" },
              { name: "Illustration", description: "Digital art" },
            ],
            columns: 4,
            style: "overlay",
          },
        },
        {
          type: "stats",
          props: {
            items: [
              { label: "Projects", value: "120+" },
              { label: "Clients", value: "35+" },
              { label: "Experience", value: "8 yrs" },
            ],
            style: "simple",
          },
        },
        {
          type: "testimonials",
          props: {
            style: "minimal",
            limit: 5,
          },
        },
        {
          type: "cta",
          props: {
            title: "Let's Work Together",
            subtitle: "Available for freelance projects",
            buttonText: "Get in Touch",
            style: "centered",
          },
        },
      ],
    },
    productPage: {
      imageLayout: "grid",
      showReviews: false,
      showRecentlyViewed: false,
      showRelatedProducts: true,
      showWishlist: false,
      showFeatures: false,
    },
    collectionPage: {
      showFilters: false,
      gridColumns: 3,
      cardStyle: "overlay",
    },
  },

  // ─── Bangladesh-Specific Templates ────────────────────────────────

  salon: {
    id: "salon",
    name: "Salon & Beauty",
    tagline: "Glamorous & Inviting",
    description: "A warm, elegant template for beauty salons, spas, and grooming studios with service menus, booking CTAs, and a luxurious feel",
    version: "1.0.0",
    category: "salon",
    isPremium: false,

    colors: {
      primary: "#9333ea",
      secondary: "#c084fc",
      accent: "#faf5ff",
      background: "#ffffff",
      surface: "#faf5ff",
      text: "#1e1b2e",
      textMuted: "#6b7280",
      border: "#e9d5ff",
      success: "#22c55e",
      error: "#ef4444",
    },

    typography: {
      headingFont: "Playfair Display",
      bodyFont: "Inter",
      headingWeight: "600",
      borderRadius: "xl",
    },

    layout: {
      maxWidth: "7xl",
      sectionSpacing: "normal",
      cardStyle: "bordered",
            productColumns: 3,
    },

    navbar: {
      style: "sticky-white",
      showSearch: false,
      showWishlist: false,
      showUserMenu: true,
      layout: "centered",
      announcementBar: {
        message: "✨ Book your Eid makeover — 20% off all services!",
        bgColor: "#9333ea",
        textColor: "#ffffff",
      },
    },

    footer: {
      style: "dark",
      showNewsletter: true,
      showSocial: true,
      columns: 4,
    },

    homePage: {
      sections: [
        {
          type: "announcement",
          props: {
            message: "✨ Book your Eid makeover — 20% off all services!",
            bgColor: "#9333ea",
            textColor: "#ffffff",
          },
        },
        {
          type: "hero",
          props: {
            style: "split",
            title: "Your Beauty, Our Passion",
            subtitle: "Premium salon services with expert stylists. From bridal packages to everyday glam — we bring out the best in you.",
            ctaText: "Book Appointment",
            ctaLink: "/products",
                        showStats: true,
            stats: [
              { label: "Happy Clients", value: "5,000+" },
              { label: "Expert Stylists", value: "15+" },
              { label: "Rating", value: "4.9★" },
            ],
          },
        },
        {
          type: "collections",
          props: {
            layout: "grid",
            columns: 3,
            showAll: true,
            title: "Our Services",
          },
        },
        {
          type: "featuredProducts",
          props: {
            layout: "grid",
            columns: 3,
            limit: 6,
            title: "Popular Packages",
            showQuickAdd: true,
          },
        },
        {
          type: "features",
          props: {
            layout: "grid",
            items: [
              { icon: "Sparkles", title: "Expert Stylists", description: "Trained professionals with years of experience" },
              { icon: "ShieldCheck", title: "Hygiene First", description: "Sterilized tools and premium products" },
              { icon: "Clock", title: "Easy Booking", description: "Book online or via WhatsApp" },
              { icon: "Heart", title: "Bridal Packages", description: "Complete bridal makeover solutions" },
            ],
            style: "minimal",
          },
        },
        {
          type: "testimonials",
          props: {
            style: "cards",
            limit: 3,
          },
        },
        {
          type: "products",
          props: {
            layout: "grid",
            columns: 3,
            showFilters: true,
            showSearch: false,
            title: "All Services & Products",
          },
        },
        {
          type: "newsletter",
          props: {
            title: "Get Beauty Tips & Offers",
            subtitle: "Subscribe for exclusive deals and beauty advice",
            style: "card",
          },
        },
      ],
    },

    productPage: {
      imageLayout: "stacked",
      showReviews: true,
      showRecentlyViewed: true,
      showRelatedProducts: true,
      showWishlist: false,
      showFeatures: true,
      features: [
        { icon: "Sparkles", title: "Premium Products", description: "Only the best brands used" },
        { icon: "ShieldCheck", title: "Satisfaction Guaranteed", description: "100% happiness promise" },
        { icon: "Clock", title: "Easy Booking", description: "Book via WhatsApp or online" },
      ],
    },

    collectionPage: {
      showFilters: true,
      gridColumns: 3,
      cardStyle: "standard",
    },
  },

  tuition: {
    id: "tuition",
    name: "Tuition & Education",
    tagline: "Learn & Grow",
    description: "A clean, professional template for tutoring centers, online courses, and educational institutions with batch schedules and enrollment",
    version: "1.0.0",
    category: "tuition",
    isPremium: false,

    colors: {
      primary: "#2563eb",
      secondary: "#60a5fa",
      accent: "#eff6ff",
      background: "#ffffff",
      surface: "#f0f7ff",
      text: "#1e293b",
      textMuted: "#64748b",
      border: "#bfdbfe",
      success: "#22c55e",
      error: "#ef4444",
    },

    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: "700",
      borderRadius: "lg",
    },

    layout: {
      maxWidth: "7xl",
      sectionSpacing: "normal",
      cardStyle: "bordered",
            productColumns: 3,
    },

    navbar: {
      style: "sticky-white",
      showSearch: true,
      showWishlist: false,
      showUserMenu: true,
      layout: "left-aligned",
      announcementBar: {
        message: "📚 HSC Special Batch starting soon — Enroll now!",
        bgColor: "#2563eb",
        textColor: "#ffffff",
      },
    },

    footer: {
      style: "dark",
      showNewsletter: true,
      showSocial: true,
      columns: 4,
    },

    homePage: {
      sections: [
        {
          type: "announcement",
          props: {
            message: "📚 HSC Special Batch starting soon — Enroll now!",
            bgColor: "#2563eb",
            textColor: "#ffffff",
          },
        },
        {
          type: "hero",
          props: {
            style: "centered",
            title: "Unlock Your Potential",
            subtitle: "Expert tutoring for HSC, SSC, and admission tests. Join thousands of successful students across Bangladesh.",
            ctaText: "Browse Courses",
            ctaLink: "/products",
                        showStats: true,
            stats: [
              { label: "Students", value: "10,000+" },
              { label: "GPA-5 Achievers", value: "2,500+" },
              { label: "Subjects", value: "30+" },
            ],
          },
        },
        {
          type: "collections",
          props: {
            layout: "grid",
            columns: 4,
            showAll: true,
            title: "Course Categories",
          },
        },
        {
          type: "featuredProducts",
          props: {
            layout: "grid",
            columns: 3,
            limit: 6,
            title: "Popular Courses",
            showQuickAdd: true,
          },
        },
        {
          type: "features",
          props: {
            layout: "grid",
            items: [
              { icon: "Users", title: "Expert Tutors", description: "BUET & DU graduates" },
              { icon: "Video", title: "Live Classes", description: "Interactive online sessions" },
              { icon: "FileText", title: "Study Materials", description: "PDF notes & model tests" },
              { icon: "BarChart3", title: "Progress Tracking", description: "Monitor your improvement" },
            ],
            style: "minimal",
          },
        },
        {
          type: "stats",
          props: {
            items: [
              { label: "Students Taught", value: "10,000+" },
              { label: "GPA-5 Scorers", value: "2,500+" },
              { label: "Medical Admits", value: "800+" },
              { label: "Engineering Admits", value: "1,200+" },
            ],
            style: "animated",
          },
        },
        {
          type: "testimonials",
          props: {
            style: "cards",
            limit: 3,
          },
        },
        {
          type: "products",
          props: {
            layout: "grid",
            columns: 3,
            showFilters: true,
            showSearch: true,
            title: "All Courses & Materials",
          },
        },
        {
          type: "newsletter",
          props: {
            title: "Stay Updated",
            subtitle: "Get exam tips, schedules, and special offers",
            style: "card",
          },
        },
      ],
    },

    productPage: {
      imageLayout: "stacked",
      showReviews: true,
      showRecentlyViewed: true,
      showRelatedProducts: true,
      showWishlist: false,
      showFeatures: true,
      features: [
        { icon: "Video", title: "Live + Recorded", description: "Never miss a class" },
        { icon: "FileText", title: "Study Materials", description: "PDF notes included" },
        { icon: "Users", title: "Doubt Solving", description: "Direct tutor access" },
      ],
    },

    collectionPage: {
      showFilters: true,
      gridColumns: 3,
      cardStyle: "standard",
    },
  },

  clinic: {
    id: "clinic",
    name: "Clinic & Healthcare",
    tagline: "Caring & Professional",
    description: "A trustworthy, clean template for clinics, diagnostic centers, and healthcare providers with appointment booking and service listings",
    version: "1.0.0",
    category: "clinic",
    isPremium: false,

    colors: {
      primary: "#0d9488",
      secondary: "#5eead4",
      accent: "#f0fdfa",
      background: "#ffffff",
      surface: "#f0fdfa",
      text: "#134e4a",
      textMuted: "#6b7280",
      border: "#99f6e4",
      success: "#22c55e",
      error: "#ef4444",
    },

    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: "700",
      borderRadius: "lg",
    },

    layout: {
      maxWidth: "7xl",
      sectionSpacing: "normal",
      cardStyle: "bordered",
            productColumns: 3,
    },

    navbar: {
      style: "sticky-white",
      showSearch: true,
      showWishlist: false,
      showUserMenu: true,
      layout: "left-aligned",
      announcementBar: {
        message: "🏥 Online consultations available — Book from home",
        bgColor: "#0d9488",
        textColor: "#ffffff",
      },
    },

    footer: {
      style: "dark",
      showNewsletter: true,
      showSocial: true,
      columns: 4,
    },

    homePage: {
      sections: [
        {
          type: "announcement",
          props: {
            message: "🏥 Online consultations available — Book from home",
            bgColor: "#0d9488",
            textColor: "#ffffff",
          },
        },
        {
          type: "hero",
          props: {
            style: "centered",
            title: "Your Health, Our Priority",
            subtitle: "Trusted healthcare services with experienced doctors. From general consultations to specialized treatments — we care for you.",
            ctaText: "Book Appointment",
            ctaLink: "/products",
                        showStats: true,
            stats: [
              { label: "Doctors", value: "25+" },
              { label: "Patients Served", value: "50,000+" },
              { label: "Rating", value: "4.8★" },
            ],
          },
        },
        {
          type: "collections",
          props: {
            layout: "grid",
            columns: 4,
            showAll: true,
            title: "Our Departments",
          },
        },
        {
          type: "featuredProducts",
          props: {
            layout: "grid",
            columns: 3,
            limit: 6,
            title: "Health Packages",
            showQuickAdd: true,
          },
        },
        {
          type: "features",
          props: {
            layout: "grid",
            items: [
              { icon: "ShieldCheck", title: "Qualified Doctors", description: "MBBS & specialist doctors" },
              { icon: "Clock", title: "Easy Appointment", description: "Book online or by phone" },
              { icon: "Truck", title: "Home Delivery", description: "Medicine delivery to your door" },
              { icon: "Heart", title: "Emergency Care", description: "24/7 emergency services" },
            ],
            style: "minimal",
          },
        },
        {
          type: "testimonials",
          props: {
            style: "cards",
            limit: 3,
          },
        },
        {
          type: "products",
          props: {
            layout: "grid",
            columns: 3,
            showFilters: true,
            showSearch: true,
            title: "Services & Packages",
          },
        },
        {
          type: "newsletter",
          props: {
            title: "Health Tips & Updates",
            subtitle: "Stay informed about health camps and offers",
            style: "card",
          },
        },
      ],
    },

    productPage: {
      imageLayout: "stacked",
      showReviews: true,
      showRecentlyViewed: true,
      showRelatedProducts: true,
      showWishlist: false,
      showFeatures: true,
      features: [
        { icon: "ShieldCheck", title: "Certified Doctors", description: "All doctors are verified" },
        { icon: "Clock", title: "Quick Consultation", description: "Average wait time under 15 min" },
        { icon: "Heart", title: "Follow-up Care", description: "Free follow-up within 7 days" },
      ],
    },

    collectionPage: {
      showFilters: true,
      gridColumns: 3,
      cardStyle: "standard",
    },
  },

  pharmacy: {
    id: "pharmacy",
    name: "Pharmacy & Medicine",
    tagline: "Trusted & Accessible",
    description: "A clean, organized template for pharmacies and medicine delivery with prescription upload, category browsing, and fast delivery focus",
    version: "1.0.0",
    category: "clinic",
    isPremium: false,

    colors: {
      primary: "#16a34a",
      secondary: "#86efac",
      accent: "#f0fdf4",
      background: "#ffffff",
      surface: "#f0fdf4",
      text: "#14532d",
      textMuted: "#6b7280",
      border: "#bbf7d0",
      success: "#22c55e",
      error: "#ef4444",
    },

    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: "700",
      borderRadius: "lg",
    },

    layout: {
      maxWidth: "7xl",
      sectionSpacing: "normal",
      cardStyle: "bordered",
            productColumns: 4,
    },

    navbar: {
      style: "sticky-white",
      showSearch: true,
      showWishlist: false,
      showUserMenu: true,
      layout: "left-aligned",
      announcementBar: {
        message: "💊 Free delivery on orders over ৳500 — Upload prescription & order",
        bgColor: "#16a34a",
        textColor: "#ffffff",
      },
    },

    footer: {
      style: "dark",
      showNewsletter: true,
      showSocial: true,
      columns: 4,
    },

    homePage: {
      sections: [
        {
          type: "announcement",
          props: {
            message: "💊 Free delivery on orders over ৳500 — Upload prescription & order",
            bgColor: "#16a34a",
            textColor: "#ffffff",
          },
        },
        {
          type: "hero",
          props: {
            style: "centered",
            title: "Your Trusted Pharmacy",
            subtitle: "Order medicines online with prescription upload. Fast delivery across Bangladesh. Genuine medicines, guaranteed.",
            ctaText: "Order Medicines",
            ctaLink: "/products",
                        showStats: true,
            stats: [
              { label: "Medicines", value: "5,000+" },
              { label: "Delivery Areas", value: "64 Districts" },
              { label: "Customers", value: "100K+" },
            ],
          },
        },
        {
          type: "collections",
          props: {
            layout: "grid",
            columns: 4,
            showAll: true,
            title: "Medicine Categories",
          },
        },
        {
          type: "featuredProducts",
          props: {
            layout: "grid",
            columns: 4,
            limit: 8,
            title: "Popular Medicines",
            showQuickAdd: true,
          },
        },
        {
          type: "features",
          props: {
            layout: "grid",
            items: [
              { icon: "ShieldCheck", title: "Genuine Medicines", description: "100% authentic products" },
              { icon: "Truck", title: "Fast Delivery", description: "Same-day in Dhaka" },
              { icon: "Upload", title: "Prescription Upload", description: "Easy prescription ordering" },
              { icon: "Clock", title: "24/7 Support", description: "Pharmacist on call" },
            ],
            style: "minimal",
          },
        },
        {
          type: "products",
          props: {
            layout: "grid",
            columns: 4,
            showFilters: true,
            showSearch: true,
            title: "All Medicines & Health Products",
          },
        },
        {
          type: "newsletter",
          props: {
            title: "Health Updates",
            subtitle: "Get health tips and medicine reminders",
            style: "card",
          },
        },
      ],
    },

    productPage: {
      imageLayout: "stacked",
      showReviews: true,
      showRecentlyViewed: true,
      showRelatedProducts: true,
      showWishlist: false,
      showFeatures: true,
      features: [
        { icon: "ShieldCheck", title: "Authentic Medicine", description: "Sourced from verified distributors" },
        { icon: "Truck", title: "Fast Delivery", description: "Same-day delivery in Dhaka" },
        { icon: "RefreshCcw", title: "Easy Returns", description: "Return policy for damaged items" },
      ],
    },

    collectionPage: {
      showFilters: true,
      gridColumns: 4,
      cardStyle: "standard",
    },
  },

  corporate: {
    id: "corporate",
    name: "Corporate & Business",
    tagline: "Professional & Trusted",
    description: "A polished, professional template for B2B companies, agencies, and service businesses with team sections, case studies, and contact forms",
    version: "1.0.0",
    category: "corporate",
    isPremium: false,

    colors: {
      primary: "#1e40af",
      secondary: "#3b82f6",
      accent: "#eff6ff",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#0f172a",
      textMuted: "#64748b",
      border: "#cbd5e1",
      success: "#22c55e",
      error: "#ef4444",
    },

    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: "700",
      borderRadius: "lg",
    },

    layout: {
      maxWidth: "7xl",
      sectionSpacing: "normal",
      cardStyle: "bordered",
            productColumns: 3,
    },

    navbar: {
      style: "sticky-white",
      showSearch: false,
      showWishlist: false,
      showUserMenu: true,
      layout: "left-aligned",
      announcementBar: {
        message: "🚀 Transform your business with our solutions",
        bgColor: "#1e40af",
        textColor: "#ffffff",
      },
    },

    footer: {
      style: "dark",
      showNewsletter: true,
      showSocial: true,
      columns: 4,
    },

    homePage: {
      sections: [
        {
          type: "announcement",
          props: {
            message: "🚀 Transform your business with our solutions",
            bgColor: "#1e40af",
            textColor: "#ffffff",
          },
        },
        {
          type: "hero",
          props: {
            style: "centered",
            title: "Building Business Excellence",
            subtitle: "Comprehensive solutions for modern enterprises. From IT services to consulting — we help you grow smarter.",
            ctaText: "Our Services",
            ctaLink: "/products",
                        showStats: true,
            stats: [
              { label: "Clients", value: "500+" },
              { label: "Projects", value: "1,200+" },
              { label: "Team Members", value: "50+" },
            ],
          },
        },
        {
          type: "features",
          props: {
            layout: "grid",
            items: [
              { icon: "Globe", title: "IT Solutions", description: "Custom software & cloud services" },
              { icon: "BarChart3", title: "Business Consulting", description: "Strategy & growth planning" },
              { icon: "ShieldCheck", title: "Cybersecurity", description: "Protect your digital assets" },
              { icon: "Users", title: "HR Solutions", description: "Talent management & training" },
              { icon: "Smartphone", title: "Digital Marketing", description: "SEO, social media & ads" },
              { icon: "CreditCard", title: "Financial Services", description: "Accounting & compliance" },
            ],
            style: "minimal",
          },
        },
        {
          type: "collections",
          props: {
            layout: "grid",
            columns: 3,
            showAll: true,
            title: "Service Categories",
          },
        },
        {
          type: "featuredProducts",
          props: {
            layout: "grid",
            columns: 3,
            limit: 6,
            title: "Featured Solutions",
            showQuickAdd: true,
          },
        },
        {
          type: "stats",
          props: {
            items: [
              { label: "Active Clients", value: "500+" },
              { label: "Projects Delivered", value: "1,200+" },
              { label: "Countries Served", value: "12" },
              { label: "Client Retention", value: "95%" },
            ],
            style: "animated",
          },
        },
        {
          type: "testimonials",
          props: {
            style: "cards",
            limit: 3,
          },
        },
        {
          type: "products",
          props: {
            layout: "grid",
            columns: 3,
            showFilters: true,
            showSearch: false,
            title: "All Services",
          },
        },
        {
          type: "cta",
          props: {
            title: "Ready to Transform Your Business?",
            subtitle: "Get a free consultation and see how we can help",
            buttonText: "Get Started",
            style: "centered",
          },
        },
      ],
    },

    productPage: {
      imageLayout: "stacked",
      showReviews: true,
      showRecentlyViewed: false,
      showRelatedProducts: true,
      showWishlist: false,
      showFeatures: true,
      features: [
        { icon: "ShieldCheck", title: "Trusted Partner", description: "ISO certified company" },
        { icon: "Clock", title: "On-Time Delivery", description: "98% on-time project completion" },
        { icon: "Users", title: "Dedicated Team", description: "Assigned project manager" },
      ],
    },

    collectionPage: {
      showFilters: true,
      gridColumns: 3,
      cardStyle: "standard",
    },
  },

  portfolio: {
    id: "portfolio",
    name: "Portfolio & Creative",
    tagline: "Showcase Your Work",
    description: "A stunning, minimal template for freelancers, designers, photographers, and creatives to showcase their portfolio and sell digital products",
    version: "1.0.0",
    category: "portfolio",
    isPremium: false,

    colors: {
      primary: "#0f172a",
      secondary: "#6366f1",
      accent: "#eef2ff",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#0f172a",
      textMuted: "#64748b",
      border: "#e2e8f0",
      success: "#22c55e",
      error: "#ef4444",
    },

    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: "700",
      borderRadius: "lg",
    },

    layout: {
      maxWidth: "7xl",
      sectionSpacing: "spacious",
      cardStyle: "bordered",
            productColumns: 3,
    },

    navbar: {
      style: "sticky-white",
      showSearch: false,
      showWishlist: false,
      showUserMenu: true,
      layout: "centered",
      announcementBar: {
        message: "🎨 Available for freelance projects — Let's talk!",
        bgColor: "#6366f1",
        textColor: "#ffffff",
      },
    },

    footer: {
      style: "dark",
      showNewsletter: true,
      showSocial: true,
      columns: 3,
    },

    homePage: {
      sections: [
        {
          type: "announcement",
          props: {
            message: "🎨 Available for freelance projects — Let's talk!",
            bgColor: "#6366f1",
            textColor: "#ffffff",
          },
        },
        {
          type: "hero",
          props: {
            style: "centered",
            title: "Creative Solutions, Beautiful Results",
            subtitle: "I design and build digital experiences that make an impact. Web design, branding, and creative consulting.",
            ctaText: "View My Work",
            ctaLink: "/products",
                        showStats: true,
            stats: [
              { label: "Projects", value: "150+" },
              { label: "Happy Clients", value: "80+" },
              { label: "Awards", value: "12" },
            ],
          },
        },
        {
          type: "collections",
          props: {
            layout: "grid",
            columns: 3,
            showAll: true,
            title: "Work Categories",
          },
        },
        {
          type: "featuredProducts",
          props: {
            layout: "grid",
            columns: 3,
            limit: 6,
            title: "Featured Projects",
            showQuickAdd: true,
          },
        },
        {
          type: "features",
          props: {
            layout: "grid",
            items: [
              { icon: "Palette", title: "UI/UX Design", description: "Beautiful & functional interfaces" },
              { icon: "Code2", title: "Web Development", description: "Fast, responsive websites" },
              { icon: "Camera", title: "Photography", description: "Professional product shots" },
              { icon: "Megaphone", title: "Brand Strategy", description: "Build your brand identity" },
            ],
            style: "minimal",
          },
        },
        {
          type: "testimonials",
          props: {
            style: "cards",
            limit: 3,
          },
        },
        {
          type: "products",
          props: {
            layout: "grid",
            columns: 3,
            showFilters: true,
            showSearch: false,
            title: "All Projects & Services",
          },
        },
        {
          type: "cta",
          props: {
            title: "Let's Work Together",
            subtitle: "Have a project in mind? I'd love to hear about it.",
            buttonText: "Start a Project",
            style: "centered",
          },
        },
      ],
    },

    productPage: {
      imageLayout: "grid",
      showReviews: true,
      showRecentlyViewed: false,
      showRelatedProducts: true,
      showWishlist: false,
      showFeatures: true,
      features: [
        { icon: "Clock", title: "Fast Turnaround", description: "Delivered on time, every time" },
        { icon: "RefreshCcw", title: "Revisions Included", description: "Up to 3 rounds of revisions" },
        { icon: "ShieldCheck", title: "Satisfaction Guaranteed", description: "100% money-back if unhappy" },
      ],
    },

    collectionPage: {
      showFilters: false,
      gridColumns: 3,
      cardStyle: "overlay",
    },
  },

}

/**
 * Get a sample config by key, or return the first one.
 */
export function getSampleConfig(key?: string): TemplateConfig {
  if (key && sampleConfigs[key]) return sampleConfigs[key]
  return Object.values(sampleConfigs)[0]
}

/**
 * Get all sample config keys.
 */
export function getSampleConfigKeys(): string[] {
  return Object.keys(sampleConfigs)
}
