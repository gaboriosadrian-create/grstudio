export interface Metric {
  id: string;
  value: string;
  label: string;
}

export interface Service {
  id: string;
  icon: string; // lucide-react icon name like "Compass", "Video", "Camera", "PenTool", "Calendar", "Sparkles"
  title: string;
  description: string;
  ctaText: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  categories: string[]; // e.g. ['reels', 'copy']
  badge: string;
  iconType: 'play' | 'camera' | 'sparkles' | 'pen' | 'grid';
  colorType: 'reels' | 'foto' | 'marca' | 'copy';
  tags: string[];
  imageUrl?: string;
  videoUrl?: string;
  imageUrls?: string[];
}

export interface ProcessStep {
  id: string;
  number: number;
  title: string;
  description: string;
}

export interface PricePlan {
  id: string;
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  featured: boolean;
  buttonText: string;
  bonusWarranty?: string;
  bonusImage?: string;
  hasDiscount?: boolean;
  discountLabel?: string;
  discountedPrice?: string;
}

export interface ProfileInfo {
  name: string;
  initials: string;
  logoUrl?: string;
  profilePhotoUrl?: string;
  role: string;
  email: string;
  phone: string;
  whatsappMessage: string;
  instagram: string;
  tiktok: string;
  linkedin: string;
}

export interface HeroInfo {
  eyebrow: string;
  title: string;
  gradientTitle: string;
  copy: string;
  trustTags: string[];
}

export interface PortfolioData {
  profile: ProfileInfo;
  hero: HeroInfo;
  metrics: Metric[];
  services: Service[];
  projects: Project[];
  steps: ProcessStep[];
  plans: PricePlan[];
}
