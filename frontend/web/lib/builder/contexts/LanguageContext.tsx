"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type Language = "en" | "bn";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof en) => string;
}

export const en = {
  // Navigation
  dashboard: "Dashboard",
  products: "Products",
  orders: "Orders",
  marketing: "Marketing",
  analytics: "Analytics",
  settings: "Settings",
  stores: "Stores",
  overview: "Overview",
  templates: "Templates",
  customize: "Customize",
  campaigns: "Campaigns",
  discounts: "Discounts",
  seo: "SEO",
  social: "Social Media",
  newsletter: "Newsletter",
  coupons: "Coupons",
  leads: "Leads",

  // AI
  aiAssistant: "AI Assistant",
  askAi: "Ask AI",
  generateContent: "Generate Content",
  recommendTemplate: "Recommend Template",
  aiTips: "Get AI Tips",
  aiTyping: "AI is thinking...",

  // Actions
  save: "Save",
  cancel: "Cancel",
  delete: "Delete",
  edit: "Edit",
  preview: "Preview",
  publish: "Publish",
  create: "Create",
  addProduct: "Add Product",
  addStore: "Add Store",
  loading: "Loading...",
  noData: "No data available",
  search: "Search...",
  success: "Success!",
  error: "Error!",
  startFree: "Start for free",
  login: "Log in",
  logout: "Log out",
  welcome: "Welcome",
  goodMorning: "Good morning",
  goodAfternoon: "Good afternoon",
  goodEvening: "Good evening",

  // Template categories
  salon: "Salon & Beauty",
  tuition: "Tuition & Education",
  clinic: "Clinic & Healthcare",
  pharmacy: "Pharmacy & Wellness",
  corporate: "Corporate & Business",
  portfolio: "Portfolio & Creative",
  fashion: "Fashion",
  food: "Food & Restaurant",
  electronics: "Electronics",
  grocery: "Grocery",

  // Onboarding
  chooseTemplate: "Choose a Template",
  businessType: "Business Type",
  storeName: "Store Name",
  subdomain: "Subdomain",
  createStore: "Create Store",
  nextStep: "Next",
  prevStep: "Back",

  // Marketing
  activeCampaigns: "Active Campaigns",
  totalLeads: "Total Leads",
  conversionRate: "Conversion Rate",
  emailOpenRate: "Email Open Rate",
  createCampaign: "Create Campaign",
  campaignName: "Campaign Name",
  campaignType: "Campaign Type",
  startDate: "Start Date",
  endDate: "End Date",
  couponCode: "Coupon Code",
  discountType: "Discount Type",
  discountValue: "Discount Value",
  minOrder: "Minimum Order",
  maxDiscount: "Max Discount",
  usageLimit: "Usage Limit",
  metaTitle: "Meta Title",
  metaDescription: "Meta Description",
  keywords: "Keywords",
  ogImage: "OG Image",
  seoScore: "SEO Score",
  analyzeSeo: "Analyze SEO",
  facebookPage: "Facebook Page",
  instagramHandle: "Instagram Handle",
  whatsappNumber: "WhatsApp Number",

  // Analytics
  totalRevenue: "Total Revenue",
  totalOrders: "Total Orders",
  totalCustomers: "Total Customers",
  avgOrderValue: "Avg Order Value",
  revenueChart: "Revenue Chart",
  ordersChart: "Orders Chart",
  topProducts: "Top Products",
  recentOrders: "Recent Orders",
  last7Days: "Last 7 days",
  last30Days: "Last 30 days",
  allTime: "All time",

  // Currency
  bdt: "৳",

  // Common
  viewAll: "View All",
  noResults: "No results found",
  confirm: "Confirm",
  close: "Close",
  back: "Back",
  continue: "Continue",
  submit: "Submit",
  update: "Update",
  import: "Import",
  export: "Export",
  filter: "Filter",
  sort: "Sort",
  status: "Status",
  active: "Active",
  inactive: "Inactive",
  pending: "Pending",
  completed: "Completed",
  cancelled: "Cancelled",
} as const;

export const bn = {
  // Navigation
  dashboard: "ড্যাশবোর্ড",
  products: "প্রোডাক্ট",
  orders: "অর্ডার",
  marketing: "মার্কেটিং",
  analytics: "বিশ্লেষণ",
  settings: "সেটিংস",
  stores: "স্টোর",
  overview: "সারসংক্ষেপ",
  templates: "টেমপ্লেট",
  customize: "কাস্টমাইজ",
  campaigns: "ক্যাম্পেইন",
  discounts: "ছাড়",
  seo: "এসইও",
  social: "সোশ্যাল মিডিয়া",
  newsletter: "নিউজলেটার",
  coupons: "কুপন",
  leads: "লিড",

  // AI
  aiAssistant: "এআই সহায়ক",
  askAi: "এআই কে জিজ্ঞাসা করুন",
  generateContent: "কন্টেন্ট তৈরি করুন",
  recommendTemplate: "টেমপ্লেট সুপারিশ",
  aiTips: "এআই টিপস নিন",
  aiTyping: "এআই চিন্তা করছে...",

  // Actions
  save: "সংরক্ষণ",
  cancel: "বাতিল",
  delete: "মুছে ফেলুন",
  edit: "সম্পাদনা",
  preview: "প্রিভিউ",
  publish: "প্রকাশ",
  create: "তৈরি করুন",
  addProduct: "প্রোডাক্ট যোগ করুন",
  addStore: "স্টোর যোগ করুন",
  loading: "লোড হচ্ছে...",
  noData: "কোনো ডাটা নেই",
  search: "অনুসন্ধান...",
  success: "সফল!",
  error: "ত্রুটি!",
  startFree: "বিনামূল্যে শুরু করুন",
  login: "লগইন",
  logout: "লগআউট",
  welcome: "স্বাগতম",
  goodMorning: "শুভ সকাল",
  goodAfternoon: "শুভ অপরাহ্ণ",
  goodEvening: "শুভ সন্ধ্যা",

  // Template categories
  salon: "সেলুন ও বিউটি",
  tuition: "টিউশন ও শিক্ষা",
  clinic: "ক্লিনিক ও স্বাস্থ্য",
  pharmacy: "ফার্মেসি ও ওয়েলনেস",
  corporate: "কর্পোরেট ও ব্যবসা",
  portfolio: "পোর্টফোলিও ও ক্রিয়েটিভ",
  fashion: "ফ্যাশন",
  food: "খাবার ও রেস্টুরেন্ট",
  electronics: "ইলেকট্রনিক্স",
  grocery: "গ্রোসারি",

  // Onboarding
  chooseTemplate: "টেমপ্লেট বেছে নিন",
  businessType: "ব্যবসার ধরন",
  storeName: "স্টোরের নাম",
  subdomain: "সাবডোমেইন",
  createStore: "স্টোর তৈরি করুন",
  nextStep: "পরবর্তী",
  prevStep: "পূর্ববর্তী",

  // Marketing
  activeCampaigns: "সক্রিয় ক্যাম্পেইন",
  totalLeads: "মোট লিড",
  conversionRate: "রূপান্তর হার",
  emailOpenRate: "ইমেইল ওপেন হার",
  createCampaign: "ক্যাম্পেইন তৈরি করুন",
  campaignName: "ক্যাম্পেইনের নাম",
  campaignType: "ক্যাম্পেইনের ধরন",
  startDate: "শুরুর তারিখ",
  endDate: "শেষের তারিখ",
  couponCode: "কুপন কোড",
  discountType: "ছাড়ের ধরন",
  discountValue: "ছাড়ের পরিমাণ",
  minOrder: "সর্বনিম্ন অর্ডার",
  maxDiscount: "সর্বোচ্চ ছাড়",
  usageLimit: "ব্যবহারের সীমা",
  metaTitle: "মেটা শিরোনাম",
  metaDescription: "মেটা বিবরণ",
  keywords: "কীওয়ার্ড",
  ogImage: "ওজি ইমেজ",
  seoScore: "এসইও স্কোর",
  analyzeSeo: "এসইও বিশ্লেষণ",
  facebookPage: "ফেসবুক পেজ",
  instagramHandle: "ইনস্টাগ্রাম হ্যান্ডেল",
  whatsappNumber: "হোয়াটসঅ্যাপ নম্বর",

  // Analytics
  totalRevenue: "মোট আয়",
  totalOrders: "মোট অর্ডার",
  totalCustomers: "মোট গ্রাহক",
  avgOrderValue: "গড় অর্ডার মূল্য",
  revenueChart: "আয় চার্ট",
  ordersChart: "অর্ডার চার্ট",
  topProducts: "শীর্ষ পণ্য",
  recentOrders: "সাম্প্রতিক অর্ডার",
  last7Days: "গত ৭ দিন",
  last30Days: "গত ৩০ দিন",
  allTime: "সব সময়",

  // Currency
  bdt: "৳",

  // Common
  viewAll: "সব দেখুন",
  noResults: "কোনো ফলাফল নেই",
  confirm: "নিশ্চিত করুন",
  close: "বন্ধ",
  back: "পিছনে",
  continue: "চালিয়ে যান",
  submit: "জমা দিন",
  update: "আপডেট",
  import: "ইম্পোর্ট",
  export: "এক্সপোর্ট",
  filter: "ফিল্টার",
  sort: "সাজান",
  status: "স্ট্যাটাস",
  active: "সক্রিয়",
  inactive: "নিষ্ক্রিয়",
  pending: "অপেক্ষমাণ",
  completed: "সম্পন্ন",
  cancelled: "বাতিল",
} as const;

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (k) => en[k] || k,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en");

  const translations = lang === "bn" ? bn : en;

  const t = (key: keyof typeof en) => translations[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
