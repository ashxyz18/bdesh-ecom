import type { StoreTemplateProps } from "../types"

// ─── Template-specific demo products ──────────────────────────────────

const roseoProducts = [
  {
    id: "roseo-1", name: "Premium Leather Bag", slug: "premium-leather-bag",
    description: "Handcrafted genuine leather bag with premium stitching and brass hardware. Perfect for everyday use with spacious compartments.",
    price: 4500, comparePrice: 5500, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1", "col-2"], attributes: { color: "Brown", material: "Leather" },
    reviews: [
      { id: "r1", rating: 5, title: "Excellent quality!", comment: "Best bag I've ever owned. The leather is supple and the stitching is impeccable.", userName: "Rahim Ahmed", createdAt: "2025-01-15T10:00:00Z" },
      { id: "r2", rating: 4, title: "Great value", comment: "Very good quality for the price. Slightly smaller than expected.", userName: "Fatima Khan", createdAt: "2025-01-10T10:00:00Z" },
    ], averageRating: 4.5, reviewCount: 2,
  },
  {
    id: "roseo-2", name: "Silk Scarf Collection", slug: "silk-scarf-collection",
    description: "Luxurious silk scarf with traditional Bengali motifs. Lightweight and elegant for any occasion.",
    price: 1200, comparePrice: 1800, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1", "col-3"], attributes: { color: "Multi", material: "Silk" },
    reviews: [
      { id: "r3", rating: 5, title: "Beautiful design", comment: "The traditional motifs are stunning. Gets compliments everywhere!", userName: "Nusrat Jahan", createdAt: "2025-02-01T10:00:00Z" },
    ], averageRating: 5.0, reviewCount: 1,
  },
  {
    id: "roseo-3", name: "Bengali Muslin Saree", slug: "bengali-muslin-saree",
    description: "Authentic Bengali muslin saree with gold border. A timeless piece for special occasions.",
    price: 6500, comparePrice: 8000, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-2", "col-3"], attributes: { color: "Red", material: "Muslin" },
    reviews: [
      { id: "r5", rating: 5, title: "Stunning!", comment: "The muslin is so soft and the gold border is exquisite.", userName: "Taslima Begum", createdAt: "2025-02-05T10:00:00Z" },
      { id: "r6", rating: 5, title: "Perfect for weddings", comment: "Wore this to a wedding and got so many compliments.", userName: "Rashida Akter", createdAt: "2025-01-28T10:00:00Z" },
    ], averageRating: 5.0, reviewCount: 2,
  },
  {
    id: "roseo-4", name: "Designer Wallet", slug: "designer-wallet",
    description: "Slim designer wallet with RFID protection. Multiple card slots and a coin pocket.",
    price: 1800, comparePrice: 2200, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1", "col-2"], attributes: { color: "Black", material: "Leather" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "roseo-5", name: "Premium Watch", slug: "premium-watch",
    description: "Elegant stainless steel watch with leather strap. Water resistant up to 50m.",
    price: 8500, comparePrice: 10000, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1"], attributes: { color: "Silver", material: "Stainless Steel" },
    reviews: [
      { id: "r9", rating: 5, title: "Classy timepiece", comment: "Looks much more expensive than it is. Great build quality.", userName: "Arif Rahman", createdAt: "2025-02-08T10:00:00Z" },
    ], averageRating: 5.0, reviewCount: 1,
  },
  {
    id: "roseo-6", name: "Brass Tea Set", slug: "brass-tea-set",
    description: "Traditional brass tea set with intricate engravings. Includes teapot and 4 cups.",
    price: 3200, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-3"], attributes: { material: "Brass", pieces: "5" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "roseo-7", name: "Handmade Jewelry Box", slug: "handmade-jewelry-box",
    description: "Beautifully crafted wooden jewelry box with velvet lining. A perfect gift for loved ones.",
    price: 950, comparePrice: 1200, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-3"], attributes: { material: "Wood", size: "Medium" },
    reviews: [
      { id: "r4", rating: 4, title: "Nice gift", comment: "Bought this as a gift and the recipient loved it!", userName: "Kamal Hossain", createdAt: "2025-01-20T10:00:00Z" },
    ], averageRating: 4.0, reviewCount: 1,
  },
  {
    id: "roseo-8", name: "Cotton Kurta Set", slug: "cotton-kurta-set",
    description: "Comfortable cotton kurta set with intricate embroidery. Perfect for festive occasions.",
    price: 2800, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-2"], attributes: { color: "White", size: "M", material: "Cotton" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
]

const defaultProducts = [
  {
    id: "def-1", name: "Wireless Bluetooth Speaker", slug: "wireless-bluetooth-speaker",
    description: "Portable speaker with 360° sound, 12-hour battery, and waterproof design. Perfect for outdoor adventures.",
    price: 2500, comparePrice: 3200, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1", "col-2"], attributes: { color: "Black", battery: "12 hours" },
    reviews: [
      { id: "dr1", rating: 5, title: "Amazing sound!", comment: "Best portable speaker in this price range. Bass is incredible.", userName: "Sakib Hasan", createdAt: "2025-02-10T10:00:00Z" },
    ], averageRating: 5.0, reviewCount: 1,
  },
  {
    id: "def-2", name: "Organic Face Cream", slug: "organic-face-cream",
    description: "Natural organic face cream with neem and turmeric. Suitable for all skin types.",
    price: 650, comparePrice: 800, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-4"], attributes: { size: "100ml", type: "Organic" },
    reviews: [
      { id: "dr2", rating: 4, title: "Good product", comment: "My skin feels much better after using this for a week.", userName: "Mita Roy", createdAt: "2025-02-10T10:00:00Z" },
    ], averageRating: 4.0, reviewCount: 1,
  },
  {
    id: "def-3", name: "Cotton Kurta Set", slug: "cotton-kurta-set",
    description: "Comfortable cotton kurta set with intricate embroidery. Perfect for festive occasions.",
    price: 2800, comparePrice: null, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-2"], attributes: { color: "White", size: "M", material: "Cotton" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "def-4", name: "Handwoven Basket", slug: "handwoven-basket",
    description: "Beautiful handwoven basket made from natural jute. Perfect for home decor and storage.",
    price: 450, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-3"], attributes: { material: "Jute", size: "Large" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "def-5", name: "Premium Watch", slug: "premium-watch",
    description: "Elegant stainless steel watch with leather strap. Water resistant up to 50m.",
    price: 8500, comparePrice: 10000, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1"], attributes: { color: "Silver", material: "Stainless Steel" },
    reviews: [
      { id: "dr3", rating: 5, title: "Classy timepiece", comment: "Looks much more expensive than it is.", userName: "Arif Rahman", createdAt: "2025-02-08T10:00:00Z" },
    ], averageRating: 5.0, reviewCount: 1,
  },
  {
    id: "def-6", name: "Designer Wallet", slug: "designer-wallet",
    description: "Slim designer wallet with RFID protection. Multiple card slots and a coin pocket.",
    price: 1800, comparePrice: 2200, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-1"], attributes: { color: "Black", material: "Leather" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "def-7", name: "Silk Scarf Collection", slug: "silk-scarf-collection",
    description: "Luxurious silk scarf with traditional Bengali motifs. Lightweight and elegant for any occasion.",
    price: 1200, comparePrice: 1800, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-2", "col-3"], attributes: { color: "Multi", material: "Silk" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "def-8", name: "Brass Tea Set", slug: "brass-tea-set",
    description: "Traditional brass tea set with intricate engravings. Includes teapot and 4 cups.",
    price: 3200, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-3"], attributes: { material: "Brass", pieces: "5" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
]

const shopifyProducts = [
  {
    id: "min-1", name: "Minimal Desk Lamp", slug: "minimal-desk-lamp",
    description: "Sleek adjustable desk lamp with warm LED light. USB-C powered with touch dimmer.",
    price: 2200, comparePrice: 2800, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1"], attributes: { color: "White", power: "USB-C" },
    reviews: [
      { id: "mr1", rating: 5, title: "Perfect desk companion", comment: "Clean design, great light quality. Love the touch dimmer.", userName: "Nayeem Khan", createdAt: "2025-01-20T10:00:00Z" },
    ], averageRating: 5.0, reviewCount: 1,
  },
  {
    id: "min-2", name: "Canvas Tote Bag", slug: "canvas-tote-bag",
    description: "Durable organic cotton tote bag. Minimalist design, maximum utility.",
    price: 850, comparePrice: null, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-2"], attributes: { color: "Natural", material: "Organic Cotton" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "min-3", name: "Ceramic Mug Set", slug: "ceramic-mug-set",
    description: "Set of 4 handmade ceramic mugs. Dishwasher and microwave safe.",
    price: 1500, comparePrice: 1800, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-3"], attributes: { material: "Ceramic", pieces: "4" },
    reviews: [
      { id: "mr2", rating: 4, title: "Beautiful mugs", comment: "Love the handmade feel. Slightly different sizes but that's the charm.", userName: "Tania Akter", createdAt: "2025-02-01T10:00:00Z" },
    ], averageRating: 4.0, reviewCount: 1,
  },
  {
    id: "min-4", name: "Bamboo Notebook", slug: "bamboo-notebook",
    description: "Eco-friendly bamboo cover notebook with 200 pages of recycled paper.",
    price: 450, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-1"], attributes: { material: "Bamboo", pages: "200" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "min-5", name: "Wireless Charger Pad", slug: "wireless-charger-pad",
    description: "Slim wireless charging pad compatible with all Qi-enabled devices. LED indicator.",
    price: 1200, comparePrice: 1500, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1", "col-2"], attributes: { color: "Black", type: "Qi" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "min-6", name: "Linen Throw Pillow", slug: "linen-throw-pillow",
    description: "Soft linen throw pillow cover with hidden zipper. Machine washable.",
    price: 950, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-3"], attributes: { material: "Linen", size: "18x18\"" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
]

const shopnestProducts = [
  {
    id: "sn-1", name: "Floral Maxi Dress", slug: "floral-maxi-dress",
    description: "Elegant floral print maxi dress in soft chiffon. Perfect for summer occasions.",
    price: 3200, comparePrice: 4000, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1", "col-2"], attributes: { color: "Pink", size: "M", material: "Chiffon" },
    reviews: [
      { id: "snr1", rating: 5, title: "Gorgeous dress!", comment: "The floral print is even more beautiful in person. Flattering fit.", userName: "Nusrat Jahan", createdAt: "2025-02-05T10:00:00Z" },
    ], averageRating: 5.0, reviewCount: 1,
  },
  {
    id: "sn-2", name: "Silk Blouse", slug: "silk-blouse",
    description: "Luxurious silk blouse with pearl buttons. Relaxed fit for effortless elegance.",
    price: 2800, comparePrice: null, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1"], attributes: { color: "Ivory", size: "S", material: "Silk" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "sn-3", name: "Tailored Wool Coat", slug: "tailored-wool-coat",
    description: "Classic tailored wool coat with satin lining. Timeless silhouette for the modern woman.",
    price: 8500, comparePrice: 10000, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-2"], attributes: { color: "Camel", size: "L", material: "Wool" },
    reviews: [
      { id: "snr2", rating: 5, title: "Investment piece", comment: "Worth every penny. The tailoring is impeccable.", userName: "Rashida Akter", createdAt: "2025-01-28T10:00:00Z" },
      { id: "snr3", rating: 4, title: "Runs slightly large", comment: "Beautiful coat but consider sizing down.", userName: "Fatima Khan", createdAt: "2025-01-15T10:00:00Z" },
    ], averageRating: 4.5, reviewCount: 2,
  },
  {
    id: "sn-4", name: "Leather Crossbody Bag", slug: "leather-crossbody-bag",
    description: "Premium leather crossbody bag with gold hardware. Adjustable strap.",
    price: 4500, comparePrice: 5500, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-3"], attributes: { color: "Tan", material: "Leather" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "sn-5", name: "Cashmere Wrap", slug: "cashmere-wrap",
    description: "Pure cashmere wrap scarf. Incredibly soft and lightweight.",
    price: 5800, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-2", "col-3"], attributes: { color: "Burgundy", material: "Cashmere" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "sn-6", name: "Pearl Earrings", slug: "pearl-earrings",
    description: "Freshwater pearl drop earrings with sterling silver hooks.",
    price: 1500, comparePrice: 1800, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-3"], attributes: { material: "Pearl", type: "Drop" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
]

const foodProducts = [
  {
    id: "food-1", name: "Chicken Biryani", slug: "chicken-biryani",
    description: "Aromatic basmati rice with tender chicken, saffron, and traditional spices. Serves 2.",
    price: 450, comparePrice: null, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1", "col-2"], attributes: { serves: "2", spicy: "Medium" },
    reviews: [
      { id: "fr1", rating: 5, title: "Best biryani in town!", comment: "The aroma and taste are absolutely authentic. Will order again!", userName: "Kamal Hossain", createdAt: "2025-02-10T10:00:00Z" },
    ], averageRating: 5.0, reviewCount: 1,
  },
  {
    id: "food-2", name: "Beef Kacchi Biryani", slug: "beef-kacchi-biryani",
    description: "Traditional Kacchi biryani with tender beef, potatoes, and aromatic rice. Slow-cooked for 6 hours.",
    price: 550, comparePrice: null, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1"], attributes: { serves: "2", spicy: "Hot" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "food-3", name: "Grilled Chicken Platter", slug: "grilled-chicken-platter",
    description: "Juicy grilled chicken with naan, salad, and special sauce. Serves 1.",
    price: 380, comparePrice: 450, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1", "col-3"], attributes: { serves: "1", spicy: "Mild" },
    reviews: [
      { id: "fr2", rating: 4, title: "Great portion size", comment: "Chicken was tender and the sauce was delicious.", userName: "Sadia Islam", createdAt: "2025-02-08T10:00:00Z" },
    ], averageRating: 4.0, reviewCount: 1,
  },
  {
    id: "food-4", name: "Mutton Rezala", slug: "mutton-rezala",
    description: "Creamy mutton rezala with cashew nut paste and aromatic spices. A Mughlai classic.",
    price: 520, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-2"], attributes: { serves: "2", spicy: "Mild" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "food-5", name: "Fish Curry Meal", slug: "fish-curry-meal",
    description: "Traditional Bengali fish curry with rice. Made with fresh Rui fish and seasonal vegetables.",
    price: 350, comparePrice: null, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-2", "col-3"], attributes: { serves: "1", spicy: "Medium" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "food-6", name: "Mango Lassi", slug: "mango-lassi",
    description: "Refreshing mango lassi made with fresh ripe mangoes and creamy yogurt.",
    price: 120, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-4"], attributes: { size: "350ml", type: "Cold" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "food-7", name: "Gulab Jamun (6 pcs)", slug: "gulab-jamun",
    description: "Soft and spongy gulab jamun soaked in rose-flavored sugar syrup.",
    price: 180, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-4"], attributes: { pieces: "6", type: "Dessert" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "food-8", name: "Naan Bread (2 pcs)", slug: "naan-bread",
    description: "Freshly baked butter naan. Soft and fluffy, perfect with any curry.",
    price: 80, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-3"], attributes: { pieces: "2", type: "Bread" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
]

const electroProducts = [
  {
    id: "el-1", name: "Pro Max Smartphone", slug: "pro-max-smartphone",
    description: "Flagship smartphone with 6.7\" OLED display, A17 chip, and pro camera system. 256GB storage.",
    price: 89000, comparePrice: 95000, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1"], attributes: { RAM: "8GB", Storage: "256GB", Battery: "4500mAh", Display: "6.7\" OLED", Processor: "A17 Chip" },
    reviews: [
      { id: "er1", rating: 5, title: "Best phone ever!", comment: "Camera is insane and battery lasts all day.", userName: "Tanvir Ahmed", createdAt: "2025-02-10T10:00:00Z" },
      { id: "er2", rating: 4, title: "Great but expensive", comment: "Amazing performance but the price is steep.", userName: "Rafi Islam", createdAt: "2025-02-05T10:00:00Z" },
    ], averageRating: 4.5, reviewCount: 2,
  },
  {
    id: "el-2", name: "Ultra Laptop 15\"", slug: "ultra-laptop-15",
    description: "Thin & light laptop with M3 chip, 15\" Retina display, and 18-hour battery life.",
    price: 125000, comparePrice: 140000, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-2"], attributes: { RAM: "16GB", Storage: "512GB SSD", Battery: "18 hours", Display: "15\" Retina", Processor: "M3 Chip" },
    reviews: [
      { id: "er3", rating: 5, title: "Incredible machine", comment: "Handles everything I throw at it. Battery life is unreal.", userName: "Samiha Rahman", createdAt: "2025-01-28T10:00:00Z" },
    ], averageRating: 5.0, reviewCount: 1,
  },
  {
    id: "el-3", name: "Wireless ANC Headphones", slug: "wireless-anc-headphones",
    description: "Premium noise-cancelling headphones with 30-hour battery and Hi-Res audio support.",
    price: 15000, comparePrice: 18000, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-3"], attributes: { Battery: "30 hours", ANC: "Yes", Driver: "40mm", Connectivity: "Bluetooth 5.3" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "el-4", name: "Gaming Mechanical Keyboard", slug: "gaming-mechanical-keyboard",
    description: "RGB mechanical keyboard with Cherry MX switches and aluminum frame.",
    price: 8500, comparePrice: null, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-4"], attributes: { Switches: "Cherry MX Red", Layout: "Full Size", Backlight: "RGB", Connection: "USB-C" },
    reviews: [
      { id: "er4", rating: 5, title: "Typing heaven", comment: "The Cherry MX Reds are so smooth. Build quality is top notch.", userName: "Zahid Hasan", createdAt: "2025-02-01T10:00:00Z" },
    ], averageRating: 5.0, reviewCount: 1,
  },
  {
    id: "el-5", name: "4K Action Camera", slug: "4k-action-camera",
    description: "Waterproof 4K action camera with image stabilization and touch screen.",
    price: 22000, comparePrice: 25000, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-3", "col-4"], attributes: { Resolution: "4K 60fps", Waterproof: "10m", Screen: "2\" Touch", Stabilization: "EIS" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "el-6", name: "Smart Fitness Watch", slug: "smart-fitness-watch",
    description: "Advanced fitness tracker with GPS, heart rate monitor, and 7-day battery life.",
    price: 12000, comparePrice: 15000, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1", "col-3"], attributes: { Battery: "7 days", GPS: "Built-in", Display: "1.4\" AMOLED", Water_Rating: "5ATM" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "el-7", name: "Portable Bluetooth Speaker", slug: "portable-bluetooth-speaker",
    description: "360° sound portable speaker with deep bass and 20-hour battery. IP67 waterproof.",
    price: 6500, comparePrice: 8000, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-3"], attributes: { Battery: "20 hours", Waterproof: "IP67", Driver: "52mm", Weight: "580g" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "el-8", name: "USB-C Hub 7-in-1", slug: "usb-c-hub-7in1",
    description: "7-in-1 USB-C hub with HDMI 4K, USB 3.0, SD card reader, and PD charging.",
    price: 3500, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-4"], attributes: { Ports: "7", HDMI: "4K 60Hz", USB: "3.0 x2", PD: "100W" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
]

const boutiqueProducts = [
  {
    id: "bt-1", name: "Rose Petal Blouse", slug: "rose-petal-blouse",
    description: "Delicate rose-print blouse in soft georgette fabric. Puff sleeves and pearl button closure.",
    price: 2200, comparePrice: 2800, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1", "col-2"], attributes: { color: "Blush Pink", size: "S/M/L", material: "Georgette" },
    reviews: [
      { id: "btr1", rating: 5, title: "So romantic!", comment: "The rose print is gorgeous. Fits perfectly.", userName: "Anika Rahman", createdAt: "2025-02-10T10:00:00Z" },
    ], averageRating: 5.0, reviewCount: 1,
  },
  {
    id: "bt-2", name: "Pleated Midi Skirt", slug: "pleated-midi-skirt",
    description: "Flowing pleated midi skirt in champagne gold. Elastic waistband for comfort.",
    price: 2800, comparePrice: null, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1"], attributes: { color: "Champagne", size: "S/M/L", material: "Satin" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "bt-3", name: "Embroidered Linen Dress", slug: "embroidered-linen-dress",
    description: "Hand-embroidered linen dress with a relaxed silhouette. Perfect for warm days.",
    price: 3500, comparePrice: 4200, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-2"], attributes: { color: "Ivory", size: "S/M/L", material: "Linen" },
    reviews: [
      { id: "btr2", rating: 5, title: "Summer essential", comment: "The embroidery is exquisite. So comfortable in the heat.", userName: "Nadia Islam", createdAt: "2025-02-05T10:00:00Z" },
      { id: "btr3", rating: 4, title: "Beautiful but delicate", comment: "Gorgeous dress but needs gentle washing.", userName: "Taslima Begum", createdAt: "2025-01-28T10:00:00Z" },
    ], averageRating: 4.5, reviewCount: 2,
  },
  {
    id: "bt-4", name: "Silk Camisole Top", slug: "silk-camisole-top",
    description: "Luxurious silk camisole with lace trim. Adjustable straps and relaxed fit.",
    price: 1800, comparePrice: null, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1", "col-3"], attributes: { color: "Dusty Rose", size: "XS/S/M", material: "Silk" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "bt-5", name: "Cashmere Cardigan", slug: "cashmere-cardigan",
    description: "Soft cashmere blend cardigan with mother-of-pearl buttons. Relaxed oversized fit.",
    price: 5500, comparePrice: 6500, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-2", "col-3"], attributes: { color: "Cream", size: "S/M/L", material: "Cashmere Blend" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "bt-6", name: "Pearl Drop Necklace", slug: "pearl-drop-necklace",
    description: "Elegant freshwater pearl drop necklace on gold-plated chain.",
    price: 2200, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-4"], attributes: { material: "Freshwater Pearl", chain: "Gold Plated" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "bt-7", name: "Velvet Evening Clutch", slug: "velvet-evening-clutch",
    description: "Luxurious velvet clutch with crystal clasp. Chain strap included.",
    price: 2800, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-4"], attributes: { color: "Burgundy", material: "Velvet", closure: "Crystal Clasp" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "bt-8", name: "Wide-Leg Linen Pants", slug: "wide-leg-linen-pants",
    description: "High-waisted wide-leg linen pants. Comfortable and effortlessly chic.",
    price: 2500, comparePrice: 3000, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-2"], attributes: { color: "Sand", size: "S/M/L", material: "Linen" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
]

const grocerProducts = [
  {
    id: "gr-1", name: "Organic Basmati Rice (5kg)", slug: "organic-basmati-rice",
    description: "Premium aged basmati rice, organically grown. Extra long grain, perfect for biryani.",
    price: 850, comparePrice: 1000, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1"], attributes: { weight: "5kg", type: "Organic", origin: "Dinajpur" },
    reviews: [
      { id: "grr1", rating: 5, title: "Best rice!", comment: "The grains are so long and fluffy. Perfect biryani rice.", userName: "Salma Khatun", createdAt: "2025-02-10T10:00:00Z" },
    ], averageRating: 5.0, reviewCount: 1,
  },
  {
    id: "gr-2", name: "Farm Fresh Eggs (12 pcs)", slug: "farm-fresh-eggs",
    description: "Free-range farm fresh eggs. Collected daily from local farms.",
    price: 180, comparePrice: null, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-2"], attributes: { quantity: "12 pcs", type: "Free Range" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "gr-3", name: "Raw Honey (500g)", slug: "raw-honey",
    description: "Pure raw honey from Sundarbans. Unprocessed and natural.",
    price: 650, comparePrice: 800, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-3"], attributes: { weight: "500g", type: "Raw", origin: "Sundarbans" },
    reviews: [
      { id: "grr2", rating: 5, title: "Real honey!", comment: "You can taste the difference from commercial honey. Amazing.", userName: "Jamil Hossain", createdAt: "2025-02-05T10:00:00Z" },
    ], averageRating: 5.0, reviewCount: 1,
  },
  {
    id: "gr-4", name: "Fresh Salmon (1kg)", slug: "fresh-salmon",
    description: "Norwegian salmon fillet, freshly cut. Rich in Omega-3.",
    price: 1200, comparePrice: null, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-2"], attributes: { weight: "1kg", type: "Fresh", origin: "Norway" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "gr-5", name: "Organic Spinach Bundle", slug: "organic-spinach",
    description: "Fresh organic spinach bundle. Harvested this morning from local farms.",
    price: 40, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-1"], attributes: { weight: "250g", type: "Organic", freshness: "Today" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "gr-6", name: "A2 Milk (1L)", slug: "a2-milk",
    description: "Pure A2 cow milk from grass-fed cows. Pasteurized and fresh.",
    price: 120, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-2"], attributes: { volume: "1L", type: "A2", pasteurized: "Yes" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "gr-7", name: "Sourdough Bread", slug: "sourdough-bread",
    description: "Artisan sourdough bread baked fresh daily. Crispy crust, soft interior.",
    price: 280, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-4"], attributes: { weight: "500g", type: "Sourdough", freshness: "Today" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "gr-8", name: "Organic Turmeric Powder (200g)", slug: "organic-turmeric-powder",
    description: "Pure organic turmeric powder from Rangamati. No additives or colors.",
    price: 220, comparePrice: 280, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-3"], attributes: { weight: "200g", type: "Organic", origin: "Rangamati" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
]

const salonProducts = [
  {
    id: "sl-1", name: "Bridal Makeup Package", slug: "bridal-makeup-package",
    description: "Complete bridal makeup with hair styling, draping, and touch-ups. Includes pre-bridal skincare session.",
    price: 15000, comparePrice: 18000, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1", "col-2"], attributes: { type: "Package", duration: "4 hours" },
    reviews: [
      { id: "slr1", rating: 5, title: "Dream wedding look!", comment: "Absolutely stunning work. I felt like a queen on my wedding day.", userName: "Nusrat Jahan", createdAt: "2025-01-15T10:00:00Z" },
    ], averageRating: 5.0, reviewCount: 1,
  },
  {
    id: "sl-2", name: "Hair Spa & Treatment", slug: "hair-spa-treatment",
    description: "Deep conditioning hair spa with keratin treatment. Restores shine and strength to damaged hair.",
    price: 2500, comparePrice: 3000, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1"], attributes: { type: "Treatment", duration: "90 min" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "sl-3", name: "Facial - Gold Radiance", slug: "facial-gold-radiance",
    description: "24K gold facial for instant radiance. Deep cleansing, exfoliation, and gold mask therapy.",
    price: 3500, comparePrice: null, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-2"], attributes: { type: "Facial", duration: "60 min" },
    reviews: [
      { id: "slr2", rating: 5, title: "Glowing skin!", comment: "My skin was literally glowing for days after this facial.", userName: "Fatima Khan", createdAt: "2025-02-01T10:00:00Z" },
    ], averageRating: 5.0, reviewCount: 1,
  },
  {
    id: "sl-4", name: "Men's Grooming Package", slug: "mens-grooming-package",
    description: "Complete grooming with haircut, beard styling, facial, and head massage.",
    price: 2000, comparePrice: 2500, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-3"], attributes: { type: "Package", duration: "2 hours" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "sl-5", name: "Mehendi Design", slug: "mehendi-design",
    description: "Intricate bridal mehendi design for hands and feet. Traditional and contemporary patterns.",
    price: 5000, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-2", "col-4"], attributes: { type: "Mehendi", duration: "3 hours" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "sl-6", name: "Hair Color & Styling", slug: "hair-color-styling",
    description: "Professional hair coloring with global brands. Includes cut and blow-dry styling.",
    price: 4000, comparePrice: 5000, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-1", "col-3"], attributes: { type: "Color", duration: "2.5 hours" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
]

const tuitionProducts = [
  {
    id: "tu-1", name: "HSC Physics Complete Course", slug: "hsc-physics-course",
    description: "Complete HSC Physics preparation with chapter-wise lectures, model tests, and doubt-clearing sessions.",
    price: 5000, comparePrice: 6000, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1", "col-2"], attributes: { subject: "Physics", class: "HSC", medium: "Bengali" },
    reviews: [
      { id: "tur1", rating: 5, title: "Got A+ in Physics!", comment: "Sir's teaching method is incredible. Highly recommended for HSC students.", userName: "Rafi Ahmed", createdAt: "2025-01-20T10:00:00Z" },
    ], averageRating: 5.0, reviewCount: 1,
  },
  {
    id: "tu-2", name: "IELTS Preparation Course", slug: "ielts-preparation-course",
    description: "Comprehensive IELTS preparation covering all 4 modules. Includes mock tests and speaking practice.",
    price: 8000, comparePrice: 10000, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1"], attributes: { subject: "English", type: "IELTS", duration: "3 months" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "tu-3", name: "Class 9-10 Math Batch", slug: "class-9-10-math-batch",
    description: "SSC Mathematics preparation with step-by-step problem solving and weekly exams.",
    price: 3000, comparePrice: null, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-2"], attributes: { subject: "Mathematics", class: "9-10", medium: "Bengali" },
    reviews: [
      { id: "tur2", rating: 4, title: "Good course", comment: "Very helpful for SSC preparation. Would like more model tests.", userName: "Sadia Islam", createdAt: "2025-02-05T10:00:00Z" },
    ], averageRating: 4.0, reviewCount: 1,
  },
  {
    id: "tu-4", name: "Web Development Bootcamp", slug: "web-development-bootcamp",
    description: "Full-stack web development with React, Node.js, and MongoDB. Project-based learning with job placement support.",
    price: 15000, comparePrice: 20000, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-3"], attributes: { subject: "Programming", type: "Bootcamp", duration: "6 months" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "tu-5", name: "BCS Preliminary Preparation", slug: "bcs-preliminary-preparation",
    description: "BCS preliminary exam preparation with subject-wise lectures, current affairs, and model tests.",
    price: 6000, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-3"], attributes: { subject: "BCS", type: "Preliminary", duration: "4 months" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "tu-6", name: "Kids English Foundation", slug: "kids-english-foundation",
    description: "Fun and interactive English foundation course for kids aged 6-10. Phonics, vocabulary, and basic grammar.",
    price: 2500, comparePrice: 3000, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-2"], attributes: { subject: "English", age: "6-10", type: "Foundation" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
]

const clinicProducts = [
  {
    id: "cl-1", name: "General Consultation", slug: "general-consultation",
    description: "Comprehensive general health check-up with experienced physicians. Includes basic blood tests.",
    price: 1500, comparePrice: null, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1", "col-2"], attributes: { type: "Consultation", duration: "30 min" },
    reviews: [
      { id: "clr1", rating: 5, title: "Very caring doctor", comment: "Doctor took time to listen to all my concerns. Excellent care.", userName: "Kamal Hossain", createdAt: "2025-02-10T10:00:00Z" },
    ], averageRating: 5.0, reviewCount: 1,
  },
  {
    id: "cl-2", name: "Dental Check-up & Cleaning", slug: "dental-checkup-cleaning",
    description: "Complete dental examination with professional cleaning and polishing. X-ray included if needed.",
    price: 2000, comparePrice: 2500, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1"], attributes: { type: "Dental", duration: "45 min" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "cl-3", name: "Skin & Dermatology Consultation", slug: "dermatology-consultation",
    description: "Expert dermatologist consultation for skin conditions, acne, eczema, and cosmetic concerns.",
    price: 2500, comparePrice: null, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-2"], attributes: { type: "Specialist", duration: "30 min" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "cl-4", name: "Full Body Health Check-up", slug: "full-body-health-checkup",
    description: "Comprehensive health screening including blood tests, ECG, X-ray, and doctor consultation.",
    price: 5000, comparePrice: 6500, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-3"], attributes: { type: "Package", duration: "3 hours" },
    reviews: [
      { id: "clr2", rating: 5, title: "Thorough check-up", comment: "Very detailed health screening. Found an early issue that was easily treated.", userName: "Arif Rahman", createdAt: "2025-01-28T10:00:00Z" },
    ], averageRating: 5.0, reviewCount: 1,
  },
  {
    id: "cl-5", name: "Eye Examination", slug: "eye-examination",
    description: "Complete eye examination with vision testing, pressure check, and retinal screening.",
    price: 1800, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-2", "col-3"], attributes: { type: "Eye Care", duration: "45 min" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "cl-6", name: "Physiotherapy Session", slug: "physiotherapy-session",
    description: "Professional physiotherapy session for pain management, injury rehabilitation, and mobility improvement.",
    price: 2000, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-1"], attributes: { type: "Therapy", duration: "60 min" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
]

const pharmacyProducts = [
  {
    id: "ph-1", name: "Napa Extra (10 tablets)", slug: "napa-extra-10-tablets",
    description: "Paracetamol 500mg + Caffeine 65mg. Fast-acting pain relief for headaches and body pain.",
    price: 45, comparePrice: null, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1"], attributes: { type: "OTC", form: "Tablet", generic: "Paracetamol" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "ph-2", name: "Seclo 20mg (14 capsules)", slug: "seclo-20mg-14-capsules",
    description: "Omeprazole 20mg capsules for gastric ulcers and acid reflux. Take before breakfast.",
    price: 85, comparePrice: 100, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1"], attributes: { type: "Prescription", form: "Capsule", generic: "Omeprazole" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "ph-3", name: "Vitamin D3 Supplement (30 caps)", slug: "vitamin-d3-supplement",
    description: "High-potency Vitamin D3 50,000 IU capsules. For bone health and immunity support.",
    price: 350, comparePrice: 400, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-2"], attributes: { type: "Supplement", form: "Capsule", category: "Vitamins" },
    reviews: [
      { id: "phr1", rating: 5, title: "Great quality", comment: "My vitamin D levels improved significantly after taking this.", userName: "Samiha Rahman", createdAt: "2025-02-01T10:00:00Z" },
    ], averageRating: 5.0, reviewCount: 1,
  },
  {
    id: "ph-4", name: "ORS Saline (10 sachets)", slug: "ors-saline-10-sachets",
    description: "Oral rehydration salts for dehydration. WHO-formulated. Essential for diarrhea and heat stroke.",
    price: 100, comparePrice: null, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1", "col-3"], attributes: { type: "OTC", form: "Powder", category: "First Aid" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "ph-5", name: "Hand Sanitizer (500ml)", slug: "hand-sanitizer-500ml",
    description: "70% alcohol-based hand sanitizer. Kills 99.9% germs. Aloe vera enriched formula.",
    price: 180, comparePrice: 220, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-3"], attributes: { type: "OTC", form: "Liquid", category: "Hygiene" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "ph-6", name: "Blood Pressure Monitor", slug: "blood-pressure-monitor",
    description: "Digital blood pressure monitor with large display. Memory function for 2 users. Arm type.",
    price: 2500, comparePrice: 3000, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-4"], attributes: { type: "Device", category: "Monitoring", warranty: "1 year" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
]

const corporateProducts = [
  {
    id: "co-1", name: "Business Website Development", slug: "business-website-development",
    description: "Professional business website with custom design, CMS, SEO optimization, and 1 year hosting.",
    price: 35000, comparePrice: 45000, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1", "col-2"], attributes: { type: "Service", timeline: "4-6 weeks", pages: "10-15" },
    reviews: [
      { id: "cor1", rating: 5, title: "Excellent work", comment: "Delivered on time with outstanding quality. Our online presence improved dramatically.", userName: "Tanvir Ahmed", createdAt: "2025-01-20T10:00:00Z" },
    ], averageRating: 5.0, reviewCount: 1,
  },
  {
    id: "co-2", name: "Digital Marketing Package", slug: "digital-marketing-package",
    description: "Complete digital marketing including SEO, social media management, and Google Ads. Monthly package.",
    price: 15000, comparePrice: null, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1"], attributes: { type: "Service", timeline: "Monthly", channels: "5+" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "co-3", name: "Brand Identity Design", slug: "brand-identity-design",
    description: "Complete brand identity package including logo, color palette, typography, and brand guidelines.",
    price: 25000, comparePrice: 30000, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-2"], attributes: { type: "Design", deliverables: "Logo + Guidelines", revisions: "3" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "co-4", name: "HR Consulting Package", slug: "hr-consulting-package",
    description: "Comprehensive HR consulting including policy development, recruitment support, and compliance audit.",
    price: 20000, comparePrice: null, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-3"], attributes: { type: "Consulting", duration: "3 months", scope: "Full HR" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "co-5", name: "Mobile App Development", slug: "mobile-app-development",
    description: "Cross-platform mobile app with React Native. Includes UI/UX design, development, and app store submission.",
    price: 80000, comparePrice: 100000, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-1", "col-3"], attributes: { type: "Service", timeline: "8-12 weeks", platforms: "iOS + Android" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "co-6", name: "Accounting & Tax Service", slug: "accounting-tax-service",
    description: "Monthly accounting, tax filing, and financial reporting for small and medium businesses.",
    price: 8000, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-3"], attributes: { type: "Service", frequency: "Monthly", scope: "Full Accounting" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
]

const portfolioProducts = [
  {
    id: "po-1", name: "E-commerce Website Design", slug: "ecommerce-website-design",
    description: "Modern e-commerce website design with product catalog, cart, and checkout flow. Fully responsive.",
    price: 45000, comparePrice: 55000, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1", "col-2"], attributes: { type: "Web Design", tools: "Figma + React", timeline: "3 weeks" },
    reviews: [
      { id: "por1", rating: 5, title: "Stunning design!", comment: "The design exceeded our expectations. Conversion rate improved by 40%.", userName: "Zahid Hasan", createdAt: "2025-02-10T10:00:00Z" },
    ], averageRating: 5.0, reviewCount: 1,
  },
  {
    id: "po-2", name: "Brand Logo Design", slug: "brand-logo-design",
    description: "Custom logo design with 5 initial concepts, 3 revisions, and final delivery in all formats.",
    price: 8000, comparePrice: 10000, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-1"], attributes: { type: "Graphic Design", deliverables: "5 concepts", formats: "AI, PNG, SVG" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "po-3", name: "Social Media Content Package", slug: "social-media-content-package",
    description: "Monthly social media content package with 20 posts, stories, and cover designs.",
    price: 12000, comparePrice: null, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-2"], attributes: { type: "Content", deliverables: "20 posts", platforms: "All" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "po-4", name: "UI/UX Design for SaaS", slug: "uiux-design-saas",
    description: "Complete UI/UX design for SaaS products. User research, wireframes, prototypes, and design system.",
    price: 60000, comparePrice: 75000, images: ["/placeholder.svg"], featured: true, status: "active",
    collectionIds: ["col-2", "col-3"], attributes: { type: "UI/UX", tools: "Figma", timeline: "6 weeks" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "po-5", name: "Photography Portfolio Shoot", slug: "photography-portfolio-shoot",
    description: "Professional photography session for products, food, or portraits. 50+ edited high-res images.",
    price: 15000, comparePrice: null, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-3"], attributes: { type: "Photography", images: "50+", resolution: "4K" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
  {
    id: "po-6", name: "Motion Graphics Video", slug: "motion-graphics-video",
    description: "60-second animated explainer video with script, storyboard, animation, and sound design.",
    price: 25000, comparePrice: 30000, images: ["/placeholder.svg"], featured: false, status: "active",
    collectionIds: ["col-1", "col-3"], attributes: { type: "Animation", duration: "60 sec", format: "MP4" },
    reviews: [], averageRating: 0, reviewCount: 0,
  },
]

// ─── Template-specific collections ──────────────────────────────────

const roseoCollections = [
  { id: "col-1", name: "New Arrivals", slug: "new-arrivals", image: null },
  { id: "col-2", name: "Fashion", slug: "fashion", image: null },
  { id: "col-3", name: "Home & Living", slug: "home-living", image: null },
]

const defaultCollections = [
  { id: "col-1", name: "New Arrivals", slug: "new-arrivals", image: null },
  { id: "col-2", name: "Fashion", slug: "fashion", image: null },
  { id: "col-3", name: "Home & Living", slug: "home-living", image: null },
  { id: "col-4", name: "Beauty & Wellness", slug: "beauty-wellness", image: null },
]

const shopifyCollections = [
  { id: "col-1", name: "Tech & Gadgets", slug: "tech-gadgets", image: null },
  { id: "col-2", name: "Bags & Accessories", slug: "bags-accessories", image: null },
  { id: "col-3", name: "Home & Kitchen", slug: "home-kitchen", image: null },
]

const shopnestCollections = [
  { id: "col-1", name: "Dresses", slug: "dresses", image: null },
  { id: "col-2", name: "Outerwear", slug: "outerwear", image: null },
  { id: "col-3", name: "Accessories", slug: "accessories", image: null },
]

const foodCollections = [
  { id: "col-1", name: "Main Course", slug: "main-course", image: null },
  { id: "col-2", name: "Traditional", slug: "traditional", image: null },
  { id: "col-3", name: "Sides & Bread", slug: "sides-bread", image: null },
  { id: "col-4", name: "Drinks & Desserts", slug: "drinks-desserts", image: null },
]

const electroCollections = [
  { id: "col-1", name: "Phones & Watches", slug: "phones-watches", image: null },
  { id: "col-2", name: "Laptops", slug: "laptops", image: null },
  { id: "col-3", name: "Audio", slug: "audio", image: null },
  { id: "col-4", name: "Gaming & Accessories", slug: "gaming-accessories", image: null },
]

const boutiqueCollections = [
  { id: "col-1", name: "Tops & Blouses", slug: "tops-blouses", image: null },
  { id: "col-2", name: "Dresses & Skirts", slug: "dresses-skirts", image: null },
  { id: "col-3", name: "Knitwear", slug: "knitwear", image: null },
  { id: "col-4", name: "Jewelry & Accessories", slug: "jewelry-accessories", image: null },
]

const grocerCollections = [
  { id: "col-1", name: "Rice & Grains", slug: "rice-grains", image: null },
  { id: "col-2", name: "Dairy & Eggs", slug: "dairy-eggs", image: null },
  { id: "col-3", name: "Honey & Spices", slug: "honey-spices", image: null },
  { id: "col-4", name: "Bakery", slug: "bakery", image: null },
]

const salonCollections = [
  { id: "col-1", name: "Hair Services", slug: "hair-services", image: null },
  { id: "col-2", name: "Beauty & Skincare", slug: "beauty-skincare", image: null },
  { id: "col-3", name: "Men's Grooming", slug: "mens-grooming", image: null },
  { id: "col-4", name: "Bridal Packages", slug: "bridal-packages", image: null },
]

const tuitionCollections = [
  { id: "col-1", name: "Language & Test Prep", slug: "language-test-prep", image: null },
  { id: "col-2", name: "Academic Courses", slug: "academic-courses", image: null },
  { id: "col-3", name: "Professional Skills", slug: "professional-skills", image: null },
]

const clinicCollections = [
  { id: "col-1", name: "General Medicine", slug: "general-medicine", image: null },
  { id: "col-2", name: "Specialist Care", slug: "specialist-care", image: null },
  { id: "col-3", name: "Health Packages", slug: "health-packages", image: null },
]

const pharmacyCollections = [
  { id: "col-1", name: "Medicines", slug: "medicines", image: null },
  { id: "col-2", name: "Supplements & Vitamins", slug: "supplements-vitamins", image: null },
  { id: "col-3", name: "First Aid & Hygiene", slug: "first-aid-hygiene", image: null },
  { id: "col-4", name: "Health Devices", slug: "health-devices", image: null },
]

const corporateCollections = [
  { id: "col-1", name: "Digital Services", slug: "digital-services", image: null },
  { id: "col-2", name: "Design & Branding", slug: "design-branding", image: null },
  { id: "col-3", name: "Business Consulting", slug: "business-consulting", image: null },
]

const portfolioCollections = [
  { id: "col-1", name: "Web & Graphic Design", slug: "web-graphic-design", image: null },
  { id: "col-2", name: "UI/UX & Content", slug: "uiux-content", image: null },
  { id: "col-3", name: "Photography & Video", slug: "photography-video", image: null },
]

// ─── Template-specific themes ──────────────────────────────────────

const demoThemes: Record<string, { primaryColor: string; secondaryColor: string; accent: string }> = {
  roseo: { primaryColor: "#1a1a1a", secondaryColor: "#D4A574", accent: "#8B4513" },
  default: { primaryColor: "#006A4E", secondaryColor: "#F42A41", accent: "#059669" },
  shopify: { primaryColor: "#1e40af", secondaryColor: "#6366f1", accent: "#3b82f6" },
  shopnest: { primaryColor: "#1a1a1a", secondaryColor: "#be9f7e", accent: "#f8f6f3" },
  food: { primaryColor: "#ea580c", secondaryColor: "#dc2626", accent: "#f97316" },
  electro: { primaryColor: "#0a0a0a", secondaryColor: "#00d4ff", accent: "#0ea5e9" },
  boutique: { primaryColor: "#881337", secondaryColor: "#f9a8d4", accent: "#fdf2f8" },
  grocer: { primaryColor: "#16a34a", secondaryColor: "#eab308", accent: "#fefce8" },
  salon: { primaryColor: "#be185d", secondaryColor: "#f9a8d4", accent: "#fdf2f8" },
  tuition: { primaryColor: "#1d4ed8", secondaryColor: "#60a5fa", accent: "#eff6ff" },
  clinic: { primaryColor: "#059669", secondaryColor: "#6ee7b7", accent: "#ecfdf5" },
  pharmacy: { primaryColor: "#0d9488", secondaryColor: "#5eead4", accent: "#f0fdfa" },
  corporate: { primaryColor: "#1e3a5f", secondaryColor: "#3b82f6", accent: "#eff6ff" },
  portfolio: { primaryColor: "#7c3aed", secondaryColor: "#a78bfa", accent: "#f5f3ff" },
}

// ─── Template-specific store info ──────────────────────────────────

interface StoreInfo {
  name: string
  description: string
}

const storeInfo: Record<string, StoreInfo> = {
  roseo: { name: "Roseo Luxury", description: "Premium leather goods and luxury fashion. Crafted with passion, designed for elegance." },
  default: { name: "BdeshShop", description: "Discover premium products crafted with care. From fashion to home decor, we have it all." },
  shopify: { name: "Minimal Store", description: "Curated essentials for modern living. Quality over quantity, always." },
  shopnest: { name: "Shopnest Fashion", description: "Sophisticated fashion and lifestyle. Where style meets substance." },
  food: { name: "Spice Garden", description: "Authentic Bengali cuisine delivered to your doorstep. Fresh ingredients, traditional recipes." },
  electro: { name: "ElectroHub", description: "Your one-stop destination for cutting-edge tech and gadgets. Best prices, guaranteed." },
  boutique: { name: "La Boutique", description: "Elegant fashion for the modern woman. Curated collections, timeless style." },
  grocer: { name: "Fresh Basket", description: "Farm-fresh groceries delivered to your door. Organic, local, and always fresh." },
  salon: { name: "Glamour Studio", description: "Premium salon and beauty services. Expert stylists, luxurious treatments, stunning results." },
  tuition: { name: "Shikkha Academy", description: "Quality education for every student. Expert tutors, proven methods, outstanding results." },
  clinic: { name: "HealthFirst Clinic", description: "Compassionate healthcare you can trust. Experienced doctors, modern facilities, affordable care." },
  pharmacy: { name: "MedPlus Pharmacy", description: "Your trusted neighborhood pharmacy. Genuine medicines, health products, and expert advice." },
  corporate: { name: "ProServe Solutions", description: "Professional business services for growth. Strategy, technology, and design under one roof." },
  portfolio: { name: "Creative Studio", description: "Award-winning design and creative services. Bringing ideas to life with passion and precision." },
}

// ─── Main export ──────────────────────────────────────────────────

export function getDemoStore(templateId: string): StoreTemplateProps["store"] {
  const theme = demoThemes[templateId] || demoThemes.default
  const info = storeInfo[templateId] || storeInfo.default

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productsMap: Record<string, any[]> = {
    roseo: roseoProducts,
    default: defaultProducts,
    shopify: shopifyProducts,
    shopnest: shopnestProducts,
    food: foodProducts,
    electro: electroProducts,
    boutique: boutiqueProducts,
    grocer: grocerProducts,
    salon: salonProducts,
    tuition: tuitionProducts,
    clinic: clinicProducts,
    pharmacy: pharmacyProducts,
    corporate: corporateProducts,
    portfolio: portfolioProducts,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collectionsMap: Record<string, any[]> = {
    roseo: roseoCollections,
    default: defaultCollections,
    shopify: shopifyCollections,
    shopnest: shopnestCollections,
    food: foodCollections,
    electro: electroCollections,
    boutique: boutiqueCollections,
    grocer: grocerCollections,
    salon: salonCollections,
    tuition: tuitionCollections,
    clinic: clinicCollections,
    pharmacy: pharmacyCollections,
    corporate: corporateCollections,
    portfolio: portfolioCollections,
  }

  return {
    id: "demo-store",
    name: info.name,
    slug: "demo",
    subdomain: "demo",
    description: info.description,
    logo: null,
    banner: null,
    theme: {
      templateId,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      customization: { accent: theme.accent },
    },
    settings: {
      whatsapp: "+8801XXXXXXXXX",
      phone: "+8801XXXXXXXXX",
      address: "Gulshan, Dhaka, Bangladesh",
      currency: "BDT",
    },
    products: productsMap[templateId] || defaultProducts,
    collections: collectionsMap[templateId] || defaultCollections,
  }
}
