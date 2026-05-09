export type BlockType = 
  | "hero" 
  | "about" 
  | "services" 
  | "gallery" 
  | "contact" 
  | "testimonials" 
  | "hours"
  | "contactForm"
  | "pricing"
  | "features"
  | "faq"
  | "team"
  | "newsletter"
  | "stats"
  | "productGrid"
  | "featuredProducts"
  | "cartSummary";

export interface BlockData {
  id: string;
  type: BlockType;
  props: Record<string, any>;
}

export interface BlockComponentProps {
  id: string;
  data: BlockData;
  isActive?: boolean;
  onUpdate?: (id: string, newData: Partial<BlockData>) => void;
  onRemove?: (id: string) => void;
  isEditable?: boolean;
  storeId?: string;
}
