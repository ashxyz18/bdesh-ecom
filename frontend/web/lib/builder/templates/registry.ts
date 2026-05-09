import { BlockData } from "../blocks/types";
import { LucideIcon, Rocket, UtensilsCrossed, Scale, Palette, Stethoscope, Dumbbell, ShoppingBag } from "lucide-react";

export interface WebsiteTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  color: string;
  icon: LucideIcon;
  blocks: BlockData[];
}

export const websiteTemplates: WebsiteTemplate[] = [
  {
    id: "startup-saas",
    name: "Startup SaaS",
    category: "business",
    description: "Modern SaaS landing page with hero, features, pricing, and faq. Perfect for startups.",
    color: "from-indigo-500 to-purple-600",
    icon: Rocket,
    blocks: [
      { id: "1", type: "hero", props: { title: "Build Faster, Scale Smarter", subtitle: "The all-in-one platform for modern teams. Streamline workflows, automate tasks, and focus on what matters most — growing your business.", ctaText: "Start Free Trial", ctaLink: "#" } },
      { id: "2", type: "features", props: { title: "Why Teams Love Us", subtitle: "Everything you need to run your business, all in one place.", features: [{ icon: "Zap", title: "Lightning Fast", description: "Deploy in seconds with our optimized infrastructure." }, { icon: "Shield", title: "Secure", description: "Enterprise-grade security with end-to-end encryption." }, { icon: "Cloud", title: "Cloud Based", description: "Access your workspace from anywhere in the world." }, { icon: "Smartphone", title: "Mobile Ready", description: "Fully responsive design that works on all devices." }, { icon: "Star", title: "Top Rated", description: "Highest customer satisfaction in the industry." }, { icon: "Heart", title: "Loved by Teams", description: "Join 10,000+ teams who trust us daily." }] } },
      { id: "3", type: "stats", props: { title: "Trusted by Industry Leaders", subtitle: "Join thousands of companies already using our platform.", stats: [{ icon: "Users", value: "10,000+", label: "Active Users" }, { icon: "Star", value: "4.9", label: "Avg. Rating" }, { icon: "Award", value: "99.9%", label: "Uptime" }, { icon: "TrendingUp", value: "3x", label: "Faster Growth" }] } },
      { id: "4", type: "pricing", props: { title: "Simple, Transparent Pricing", subtitle: "Choose the plan that works for you. No hidden fees.", plans: [{ name: "Starter", price: "$0", period: "/month", features: ["Up to 5 team members", "10GB storage", "Basic analytics", "Community support"] }, { name: "Pro", price: "$29", period: "/month", features: ["Up to 25 team members", "100GB storage", "Advanced analytics", "Priority support", "API access"] }, { name: "Enterprise", price: "$99", period: "/month", features: ["Unlimited team members", "Unlimited storage", "Custom analytics", "Dedicated support", "Custom integrations"] }] } },
      { id: "5", type: "testimonials", props: { title: "What Our Customers Say", subtitle: "Don't just take our word for it.", testimonials: [{ name: "Sarah Chen", role: "CTO, TechFlow", quote: "This platform transformed how our team works. It's incredibly intuitive and powerful.", rating: 5 }, { name: "Michael Ross", role: "Founder, StartupX", quote: "The best investment we made this year. Our productivity skyrocketed.", rating: 5 }, { name: "Emily Zhang", role: "Director, GrowthLabs", quote: "Finally, a tool that understands what teams need. Highly recommended.", rating: 5 }] } },
      { id: "6", type: "faq", props: { title: "Frequently Asked Questions", subtitle: "Everything you need to know about our platform.", questions: [{ question: "Is there a free trial?", answer: "Yes! We offer a 14-day free trial with all Pro features included. No credit card required." }, { question: "Can I cancel anytime?", answer: "Absolutely. You can cancel your subscription at any time with no questions asked." }, { question: "Do you offer discounts for non-profits?", answer: "Yes, we offer 50% off for verified non-profit organizations. Contact our sales team." }, { question: "How do I migrate from another platform?", answer: "We provide free migration assistance. Our team will handle the entire process for you." }] } },
      { id: "7", type: "newsletter", props: { title: "Stay in the Loop", subtitle: "Get the latest updates, tips, and exclusive offers delivered to your inbox.", buttonText: "Subscribe", placeholder: "Enter your email", backgroundColor: "bg-slate-900", textColor: "text-white" } },
      { id: "8", type: "contact", props: { title: "Get in Touch", phone: "+1 (555) 123-4567", email: "hello@example.com", address: "123 Startup Street, San Francisco, CA 94102" } },
    ],
  },
  {
    id: "restaurant-bistro",
    name: "Bistro & Grill",
    category: "restaurant",
    description: "Elegant restaurant website with menu, gallery, hours, and contact. Perfect for restaurants and cafes.",
    color: "from-red-600 to-orange-500",
    icon: UtensilsCrossed,
    blocks: [
      { id: "1", type: "hero", props: { title: "Bistro & Grill", subtitle: "Authentic flavors, fresh ingredients, and a warm atmosphere. Experience dining at its finest.", ctaText: "View Menu", ctaLink: "#" } },
      { id: "2", type: "about", props: { title: "Our Story", subtitle: "Founded in 2010, Bistro & Grill brings together the finest local ingredients with time-honored recipes. Our chefs craft dishes that tell a story.", description: "Every dish is a journey. From farm-fresh vegetables to premium meats, we source only the best. Our kitchen is where tradition meets innovation." } },
      { id: "3", type: "services", props: { title: "Our Specialties", services: ["Farm-to-Table Dishes", "Artisan Cocktails", "Private Dining", "Catering Services"] } },
      { id: "4", type: "gallery", props: { title: "Gallery", description: "A glimpse into our kitchen and dining experience.", columns: 3 } },
      { id: "5", type: "hours", props: { title: "Opening Hours", hours: { "Monday": "Closed", "Tuesday": "12:00 PM - 10:00 PM", "Wednesday": "12:00 PM - 10:00 PM", "Thursday": "12:00 PM - 10:00 PM", "Friday": "12:00 PM - 11:00 PM", "Saturday": "11:00 AM - 11:00 PM", "Sunday": "11:00 AM - 9:00 PM" } } },
      { id: "6", type: "testimonials", props: { title: "What Diners Say", testimonials: [{ name: "John Davis", role: "Food Critic", quote: "The best dining experience I've had this year. Every dish was a masterpiece.", rating: 5 }, { name: "Lisa Park", role: "Regular Customer", quote: "We celebrate every birthday here. The staff treats us like family.", rating: 5 }] } },
      { id: "7", type: "contact", props: { title: "Reservations", phone: "+1 (555) 987-6543", email: "reservations@bistrogrill.com", address: "456 Culinary Avenue, New York, NY 10001" } },
    ],
  },
  {
    id: "law-firm",
    name: "Legal Partners",
    category: "professional",
    description: "Professional law firm website with services, team profiles, testimonials, and contact form.",
    color: "from-slate-800 to-slate-900",
    icon: Scale,
    blocks: [
      { id: "1", type: "hero", props: { title: "Justice Delivered", subtitle: "Experienced legal counsel for individuals and businesses. We fight for your rights with integrity and dedication.", ctaText: "Free Consultation", ctaLink: "#" } },
      { id: "2", type: "services", props: { title: "Practice Areas", services: ["Corporate Law", "Family Law", "Criminal Defense", "Real Estate", "Intellectual Property", "Employment Law"] } },
      { id: "3", type: "about", props: { title: "About Our Firm", subtitle: "With over 25 years of combined experience, our team of attorneys has successfully handled thousands of cases.", description: "We believe everyone deserves access to quality legal representation. Our mission is to provide exceptional legal services that are both effective and affordable." } },
      { id: "4", type: "team", props: { title: "Meet Our Attorneys", subtitle: "Dedicated professionals committed to your success.", members: [{ name: "David Mitchell", role: "Managing Partner", bio: "20+ years in corporate and civil litigation.", social: { linkedin: "#", twitter: "#" } }, { name: "Sarah Johnson", role: "Senior Partner", bio: "Expert in family law and child custody cases.", social: { linkedin: "#", twitter: "#" } }, { name: "James Wilson", role: "Associate", bio: "Specializes in criminal defense and appeals.", social: { linkedin: "#", twitter: "#" } }, { name: "Priya Sharma", role: "Associate", bio: "Focuses on intellectual property and tech law.", social: { linkedin: "#", twitter: "#" } }] } },
      { id: "5", type: "stats", props: { title: "Our Track Record", subtitle: "Numbers that speak to our commitment and success.", stats: [{ icon: "Users", value: "5,200+", label: "Cases Won" }, { icon: "Award", value: "98%", label: "Success Rate" }, { icon: "Star", value: "25+", label: "Years Experience" }, { icon: "TrendingUp", value: "100%", label: "Client Focused" }] } },
      { id: "6", type: "testimonials", props: { title: "Client Success Stories", testimonials: [{ name: "Robert Chen", role: "Business Owner", quote: "They saved my company during a critical legal dispute. Professional and thorough.", rating: 5 }, { name: "Amanda Foster", role: "Individual Client", quote: "Compassionate and knowledgeable. They made a difficult process manageable.", rating: 5 }] } },
      { id: "7", type: "contactForm", props: { title: "Schedule a Consultation", subtitle: "Fill out the form below and we'll get back to you within 24 hours." } },
    ],
  },
  {
    id: "creative-agency",
    name: "Creative Studio",
    category: "creative",
    description: "Bold creative agency website with portfolio, services, team, and stats. Perfect for design and marketing agencies.",
    color: "from-pink-500 to-rose-600",
    icon: Palette,
    blocks: [
      { id: "1", type: "hero", props: { title: "We Create Digital Magic", subtitle: "Award-winning design and development studio crafting unforgettable digital experiences for brands worldwide.", ctaText: "View Our Work", ctaLink: "#" } },
      { id: "2", type: "features", props: { title: "What We Do", subtitle: "Full-stack creative services for the modern brand.", features: [{ icon: "Zap", title: "Brand Strategy", description: "Position your brand for long-term success and market dominance." }, { icon: "Smartphone", title: "Web Design", description: "Beautiful, responsive websites that convert visitors into customers." }, { icon: "Cloud", title: "Digital Marketing", description: "Data-driven campaigns that maximize ROI and reach." }, { icon: "Star", title: "Content Creation", description: "Compelling stories that resonate with your target audience." }, { icon: "Shield", title: "UI/UX Design", description: "User-centered design that delights and converts." }, { icon: "Heart", title: "Motion Graphics", description: "Stunning animations that bring your brand to life." }] } },
      { id: "3", type: "stats", props: { title: "Results That Matter", subtitle: "Our work speaks for itself.", stats: [{ icon: "Users", value: "500+", label: "Clients Served" }, { icon: "Star", value: "120+", label: "Awards Won" }, { icon: "Award", value: "$50M", label: "Revenue Generated" }, { icon: "TrendingUp", value: "10x", label: "Avg. ROI" }] } },
      { id: "4", type: "gallery", props: { title: "Our Portfolio", description: "A selection of our recent work across industries.", columns: 3 } },
      { id: "5", type: "team", props: { title: "The Creative Minds", subtitle: "Passionate people who love what they do.", members: [{ name: "Alex Turner", role: "Creative Director", bio: "Visionary leader with 15+ years in brand design.", social: { linkedin: "#", twitter: "#" } }, { name: "Maria Garcia", role: "Lead Designer", bio: "Expert in visual storytelling and UI/UX.", social: { linkedin: "#", twitter: "#" } }, { name: "Ryan Lee", role: "Developer", bio: "Full-stack wizard who brings designs to life.", social: { linkedin: "#", twitter: "#" } }, { name: "Emma Davis", role: "Strategist", bio: "Data-driven marketer with a creative soul.", social: { linkedin: "#", twitter: "#" } }] } },
      { id: "6", type: "testimonials", props: { title: "Client Love", testimonials: [{ name: "Jordan Smith", role: "CEO, BrandCo", quote: "They transformed our brand completely. Our customers can't stop talking about the new look.", rating: 5 }, { name: "Taylor Kim", role: "Marketing Director", quote: "The results exceeded every expectation. Truly world-class work.", rating: 5 }] } },
      { id: "7", type: "contact", props: { title: "Let's Create Together", phone: "+1 (555) 234-5678", email: "hello@creativestudio.com", address: "789 Design Blvd, Los Angeles, CA 90210" } },
    ],
  },
  {
    id: "medical-clinic",
    name: "HealthFirst Clinic",
    category: "healthcare",
    description: "Trustworthy medical clinic website with services, team, hours, testimonials, and contact.",
    color: "from-emerald-500 to-teal-600",
    icon: Stethoscope,
    blocks: [
      { id: "1", type: "hero", props: { title: "Your Health, Our Priority", subtitle: "Comprehensive healthcare services delivered with compassion, expertise, and cutting-edge technology.", ctaText: "Book Appointment", ctaLink: "#" } },
      { id: "2", type: "services", props: { title: "Our Services", services: ["General Checkups", "Pediatrics", "Cardiology", "Dermatology", "Orthopedics", "Mental Health"] } },
      { id: "3", type: "about", props: { title: "About Our Clinic", subtitle: "Founded in 2005, HealthFirst has been serving our community with dedication and excellence for nearly two decades.", description: "Our state-of-the-art facility combines modern medicine with a patient-centered approach. We believe everyone deserves access to quality healthcare." } },
      { id: "4", type: "team", props: { title: "Our Medical Team", subtitle: "Experienced professionals dedicated to your well-being.", members: [{ name: "Dr. James Carter", role: "Chief of Medicine", bio: "Board-certified physician with 20+ years of experience.", social: { linkedin: "#", twitter: "#" } }, { name: "Dr. Emily Roberts", role: "Pediatrician", bio: "Specialist in child health and development.", social: { linkedin: "#", twitter: "#" } }, { name: "Dr. Michael Chang", role: "Cardiologist", bio: "Expert in preventive and interventional cardiology.", social: { linkedin: "#", twitter: "#" } }, { name: "Sarah Miller", role: "Head Nurse", bio: "Compassionate care with 15 years of clinical experience.", social: { linkedin: "#", twitter: "#" } }] } },
      { id: "5", type: "hours", props: { title: "Clinic Hours", hours: { "Monday": "8:00 AM - 6:00 PM", "Tuesday": "8:00 AM - 6:00 PM", "Wednesday": "8:00 AM - 6:00 PM", "Thursday": "8:00 AM - 6:00 PM", "Friday": "8:00 AM - 5:00 PM", "Saturday": "9:00 AM - 2:00 PM", "Sunday": "Closed" } } },
      { id: "6", type: "testimonials", props: { title: "Patient Stories", testimonials: [{ name: "Susan Brown", role: "Patient", quote: "The team here is incredibly caring. I finally feel like my health is in good hands.", rating: 5 }, { name: "Robert Wilson", role: "Patient", quote: "Professional, thorough, and kind. Best medical experience I've ever had.", rating: 5 }] } },
      { id: "7", type: "faq", props: { title: "Common Questions", subtitle: "Everything you need to know about our services.", questions: [{ question: "Do I need to make an appointment?", answer: "We accept walk-ins, but appointments are recommended to reduce wait times." }, { question: "What insurance do you accept?", answer: "We accept most major insurance providers. Contact us for a full list." }, { question: "Are virtual consultations available?", answer: "Yes, we offer telehealth appointments for select conditions." }] } },
      { id: "8", type: "contact", props: { title: "Contact Us", phone: "+1 (555) 345-6789", email: "info@healthfirst.com", address: "321 Wellness Drive, Chicago, IL 60601" } },
    ],
  },
  {
    id: "fitness-gym",
    name: "PowerFit Gym",
    category: "fitness",
    description: "Motivating fitness website with features, pricing, team, and testimonials. Perfect for gyms and fitness studios.",
    color: "from-orange-500 to-amber-600",
    icon: Dumbbell,
    blocks: [
      { id: "1", type: "hero", props: { title: "Unleash Your Potential", subtitle: "State-of-the-art equipment, expert trainers, and a supportive community. Your fitness journey starts here.", ctaText: "Join Now", ctaLink: "#" } },
      { id: "2", type: "features", props: { title: "Why Choose PowerFit", subtitle: "Everything you need to reach your fitness goals.", features: [{ icon: "Zap", title: "24/7 Access", description: "Train on your schedule with round-the-clock gym access." }, { icon: "Shield", title: "Expert Trainers", description: "Certified professionals to guide and motivate you." }, { icon: "Cloud", title: "Group Classes", description: "From yoga to HIIT, find the perfect class for you." }, { icon: "Heart", title: "Personalized Plans", description: "Custom workout and nutrition plans based on your goals." }, { icon: "Smartphone", title: "Mobile App", description: "Track workouts, book classes, and connect with trainers." }, { icon: "Star", title: "Community", description: "Join a supportive community of fitness enthusiasts." }] } },
      { id: "3", type: "pricing", props: { title: "Membership Plans", subtitle: "Flexible plans for every budget. No hidden fees.", plans: [{ name: "Basic", price: "$19", period: "/month", features: ["Gym access (6am-10pm)", "Locker room access", "2 group classes/month", "Basic app features"] }, { name: "Premium", price: "$39", period: "/month", features: ["24/7 gym access", "Unlimited group classes", "1 personal training session", "Full app access", "Guest passes"] }, { name: "Elite", price: "$79", period: "/month", features: ["Everything in Premium", "4 personal training sessions", "Nutrition coaching", "Priority class booking", "Recovery lounge access"] }] } },
      { id: "4", type: "stats", props: { title: "Our Community", subtitle: "Join thousands who have transformed their lives.", stats: [{ icon: "Users", value: "2,500+", label: "Active Members" }, { icon: "Star", value: "50+", label: "Expert Trainers" }, { icon: "Award", value: "100+", label: "Weekly Classes" }, { icon: "TrendingUp", value: "98%", label: "Satisfaction" }] } },
      { id: "5", type: "team", props: { title: "Meet Our Trainers", subtitle: "Passionate professionals here to help you succeed.", members: [{ name: "Chris Johnson", role: "Head Trainer", bio: "Specialist in strength training and conditioning.", social: { linkedin: "#", twitter: "#" } }, { name: "Lisa Martinez", role: "Yoga Instructor", bio: "500-hour certified yoga teacher and wellness coach.", social: { linkedin: "#", twitter: "#" } }, { name: "Marcus Lee", role: "CrossFit Coach", bio: "Competitive athlete and certified CrossFit instructor.", social: { linkedin: "#", twitter: "#" } }, { name: "Anna Kowalski", role: "Nutritionist", bio: "Registered dietitian specializing in sports nutrition.", social: { linkedin: "#", twitter: "#" } }] } },
      { id: "6", type: "testimonials", props: { title: "Transformation Stories", testimonials: [{ name: "Tom Harris", role: "Member since 2022", quote: "Lost 30 pounds in 6 months. The trainers here are incredible.", rating: 5 }, { name: "Jessica Adams", role: "Member since 2023", quote: "Best gym I've ever joined. The community keeps me motivated.", rating: 5 }] } },
      { id: "7", type: "contact", props: { title: "Visit Us Today", phone: "+1 (555) 456-7890", email: "hello@powerfit.com", address: "555 Fitness Way, Miami, FL 33101" } },
    ],
  },
  {
    id: "nike-ecommerce",
    name: "Nike Style Store",
    category: "ecommerce",
    description: "Bold athletic footwear and apparel store inspired by Nike's iconic design. Features product showcase, categories, and member benefits.",
    color: "from-black to-slate-800",
    icon: ShoppingBag,
    blocks: [
      { id: "1", type: "hero", props: { title: "JUST DO IT", subtitle: "The latest in athletic footwear, apparel, and accessories. Engineered for performance, designed for style. Your journey starts here.", ctaText: "Shop Now", ctaLink: "#" } },
      { id: "2", type: "features", props: { title: "Trending Now", subtitle: "Stay ahead of the game with the latest drops and must-haves.", features: [{ icon: "Zap", title: "New Arrivals", description: "Fresh drops every week. Be the first to get the latest styles." }, { icon: "Star", title: "Best Sellers", description: "Fan favorites that never go out of style. Shop our most popular picks." }, { icon: "Heart", title: "Limited Edition", description: "Exclusive collaborations and special editions. Get them before they're gone." }, { icon: "Smartphone", title: "Member Early Access", description: "Sign up for early access to new releases, exclusive offers, and members-only perks." }] } },
      { id: "3", type: "stats", props: { title: "Why Shop With Us?", subtitle: "Millions of athletes and enthusiasts trust us for their gear.", stats: [{ icon: "Users", value: "10M+", label: "Happy Customers" }, { icon: "Star", value: "4.8", label: "Customer Rating" }, { icon: "TrendingUp", value: "500K+", label: "Products Sold" }, { icon: "Award", value: "50+", label: "Brand Partners" }] } },
      { id: "4", type: "featuredProducts", props: { title: "New Release", subtitle: "Fresh drops and trending styles for the season.", showViewAll: true, limit: 4 } },
      { id: "5", type: "about", props: { title: "Join the Movement", subtitle: "More than just a store — we're a community of athletes, creators, and dreamers pushing the limits of what's possible.", description: "Get exclusive access to limited drops, special member pricing, early access to sales, free shipping on all orders, and priority customer support. Join thousands who are already part of the movement." } },
      { id: "6", type: "newsletter", props: { title: "Be the First to Know", subtitle: "Subscribe for early access to new releases, exclusive offers, and insider news — delivered straight to your inbox.", buttonText: "Join Now", placeholder: "Enter your email address", backgroundColor: "bg-black", textColor: "text-white" } },
      { id: "7", type: "testimonials", props: { title: "What Our Athletes Say", subtitle: "Real stories from real customers who push their limits every day.", testimonials: [{ name: "Rohan Sharma", role: "Marathon Runner", quote: "The quality of the gear exceeded my expectations. My go-to store for all my running needs.", rating: 5 }, { name: "Priya Patel", role: "Fitness Trainer", quote: "I recommend this store to all my clients. Great selection, fast shipping, and unbeatable prices.", rating: 5 }, { name: "Arjun Mehta", role: "Basketball Player", quote: "Found the perfect kicks here. The limited edition drops are insane — always get compliments on court!", rating: 5 }] } },
      { id: "8", type: "faq", props: { title: "Frequently Asked Questions", subtitle: "Everything you need to know about shopping with us.", questions: [{ question: "Do you offer free shipping?", answer: "Yes! We offer free standard shipping on all orders over $50. Express shipping is also available for a flat rate." }, { question: "What is your return policy?", answer: "We offer a hassle-free 30-day return policy. Items must be in original condition with tags attached." }, { question: "How do I become a member?", answer: "Simply create an account on our website to become a member. It's completely free and unlocks exclusive perks." }, { question: "Do you offer international shipping?", answer: "Yes, we ship to over 50 countries worldwide. International shipping rates and delivery times vary by location." }] } },
      { id: "9", type: "contact", props: { title: "Get in Touch", phone: "+91 800 123 4567", email: "support@store.com", address: "123 Sports Lane, Bangalore, Karnataka 560001" } },
    ],
  },
];

export const templateCategories = [
  { id: "all", label: "All Templates" },
  { id: "business", label: "Business" },
  { id: "restaurant", label: "Restaurant" },
  { id: "professional", label: "Professional" },
  { id: "creative", label: "Creative" },
  { id: "healthcare", label: "Healthcare" },
  { id: "fitness", label: "Fitness" },
  { id: "ecommerce", label: "E-Commerce" },
];
