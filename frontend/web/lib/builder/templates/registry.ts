export interface PrebuiltWebsiteProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  badge?: string;
  image: string;
  colors: string[];
  sizes: string[];
}

export interface PrebuiltWebsite {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  color: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  isPremium: boolean;
  features: string[];
  previewImages: {
    desktop: string;
    mobile?: string;
  };
  pages: string[];
  cssVariables: Record<string, string>;
  sampleProducts: PrebuiltWebsiteProduct[];
}

export const koskiiProducts: PrebuiltWebsiteProduct[] = [
  { id: 'p1', name: 'Navy Blue Zariwork Soft Silk Designer Saree', category: 'Sarees', price: 1992, originalPrice: 2490, discount: 20, rating: 4.7, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii-navyblue-zariwork-softsilk-designer-saree-saus0040043_navy_blue_2_2.jpg?v=1767765016', colors: ['navy'], sizes: ['Free Size'] },
  { id: 'p2', name: 'Beige Chanderi Threadwork Salwar Suit', category: 'Salwar Suits', price: 2392, originalPrice: 2990, discount: 20, rating: 5.0, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/products/koskii-beige-printed-semi-crepe-designer-salwar-suit-ssss0021855_beige_1.jpg?v=1669197907', colors: ['beige'], sizes: ['S', 'M', 'L', 'XL'] },
  { id: 'p3', name: 'Black Georgette Threadwork Designer Saree', category: 'Sarees', price: 5192, originalPrice: 6490, discount: 20, rating: 4.8, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/SAUS0044237_BLACK_6.jpg?v=1752822324', colors: ['black'], sizes: ['Free Size'] },
  { id: 'p4', name: 'Sea Green Organza Zariwork Salwar Suit', category: 'Salwar Suits', price: 2622, originalPrice: 4370, discount: 40, rating: 4.7, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/SSRM0046196_SEA_GREEN_1.jpg?v=1758522681', colors: ['sea-green'], sizes: ['S', 'M', 'L'] },
  { id: 'p5', name: 'Mauve Swarovski Shimmer Designer Saree', category: 'Sarees', price: 4792, originalPrice: 5990, discount: 20, rating: 4.8, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/products/koskii-mauve-swarovski-shimmer-designer-saree-saus0018647_mauve_8.jpg?v=1748424803', colors: ['mauve'], sizes: ['Free Size'] },
  { id: 'p6', name: 'Wine Swarovski Semi Crepe Designer Saree', category: 'Sarees', price: 2392, originalPrice: 2990, discount: 20, rating: 4.6, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii-wine-swarovski-semi-crepe-designer-saree-saus0017312_wine_5_f298f650-e441-4941-a069-61bbb73382d9.jpg?v=1748424814', colors: ['wine'], sizes: ['Free Size'] },
  { id: 'p7', name: 'Navy Blue Stonework Georgette Saree', category: 'Sarees', price: 3992, originalPrice: 4990, discount: 20, rating: 4.5, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/SAUS0044175_NAVY_BLUE_4.jpg?v=1752819489', colors: ['navy'], sizes: ['Free Size'] },
  { id: 'p8', name: 'Navy Blue Swarovski Semi Crepe Saree', category: 'Sarees', price: 2392, originalPrice: 2990, discount: 20, rating: 4.8, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii-navy-blue-swarovski-semi-crepe-designer-saree-saus0017312_navy_blue_5_9263ce4e-8503-4580-b4e0-22ca59aaf743.jpg?v=1748424809', colors: ['navy'], sizes: ['Free Size'] },
  { id: 'p9', name: 'Sky Blue Organza Threadwork Salwar Suit', category: 'Salwar Suits', price: 2622, originalPrice: 4370, discount: 40, rating: 4.8, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/SSRM0043261_SKY_BLUE_10.jpg?v=1763020042', colors: ['sky-blue'], sizes: ['S', 'M', 'L', 'XL'] },
  { id: 'p10', name: 'Peacock Blue Stonework Satin Saree', category: 'Sarees', price: 7192, originalPrice: 8990, discount: 20, rating: 4.5, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii-peacockblue-swarovski-semicrepe-designer-saree-saus0029623_peacockblue_7_1c87310d-f16f-4de8-8a85-cae63c8d7636.jpg?v=1748424834', colors: ['peacock-blue'], sizes: ['Free Size'] },
  { id: 'p11', name: 'Beige Chanderi Threadwork Straight Suit', category: 'Salwar Suits', price: 2622, originalPrice: 4370, discount: 40, rating: 4.5, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/SSRM0046732_BEIGE_BROWN_1_44746f5f-9380-4382-bfcb-2d0cf7b55168.jpg?v=1764137859', colors: ['beige'], sizes: ['S', 'M', 'L'] },
  { id: 'p12', name: 'Turquoise Blue Stonework Satin Saree', category: 'Sarees', price: 3992, originalPrice: 4990, discount: 20, rating: 4.7, badge: 'Bestseller', image: 'https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii-turquoiseblue-stonework-satin-designer-saree-saus0032198_turquoise_blue_1_7.jpg?v=1747911009', colors: ['turquoise'], sizes: ['Free Size'] },
];

export const prebuiltWebsites: PrebuiltWebsite[] = [
  {
    id: "koskii",
    name: "Koskii",
    tagline: "Women's Occasion Wear",
    description: "Elegant ethnic fashion e-commerce with silk sarees, salwar suits, lehengas, and gowns. Features product sliders, wishlists, and a premium shopping experience.",
    category: "fashion",
    color: "from-stone-900 to-amber-900",
    primaryColor: "#1a1a1a",
    secondaryColor: "#d4af37",
    accentColor: "#d4af37",
    isPremium: true,
    features: [
      "Product sliders with quick add",
      "Wishlist functionality",
      "Shopping cart drawer",
      "Search overlay",
      "Mobile bottom navigation",
      "Testimonial section",
      "Newsletter signup",
      "Category grids"
    ],
    previewImages: {
      desktop: "https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii_logo_left_right_white.0u84b2px.n_j~.png",
    },
    pages: ["index", "product", "account", "wishlist"],
    cssVariables: {
      "--primary": "#1a1a1a",
      "--accent": "#d4af37",
      "--text": "#1a1a1a",
      "--text-muted": "#666",
      "--bg": "#f5f5f5",
      "--white": "#ffffff",
      "--border": "#e0e0e0",
      "--sale": "#e74c3c",
    },
    sampleProducts: koskiiProducts,
  },
];

export function getPrebuiltWebsite(id: string): PrebuiltWebsite | undefined {
  return prebuiltWebsites.find(w => w.id === id);
}