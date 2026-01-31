import { Project, ColorScheme } from './types';

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    number: '01',
    title: 'FoodCourier',
    subtitle: 'Mobile Food Marketplace',
    description: 'A comprehensive multi-vendor delivery platform designed for seamless food ordering and logistics management.',
    tech: ['React Native', 'Node.js', 'Firebase', 'Google Maps'],
    role: 'Web Developer',
    url: 'https://foodcourier.web.app',
  },
  {
    id: 'p2',
    number: '02',
    title: 'Daniel Philip Watch',
    subtitle: 'eCommerce Management',
    description: 'Premium eCommerce storefront management and creative support for a global watch and accessory brand.',
    tech: ['Shopify', 'Liquid', 'Graphic Design', 'Marketing'],
    role: 'Web Developer',
    url: 'https://danielphilip.com/',
  },
  {
    id: 'p3',
    number: '03',
    title: 'Fusion Recovery',
    subtitle: 'Health & Wellness Clinic',
    description: 'Digital infrastructure and administrative support for a specialized health and wellness recovery clinic.',
    tech: ['Digital Strategy', 'Admin Systems', 'Web Management'],
    role: 'Web Developer',
    url: 'https://www.fusion-recovery.com/',
  },
  {
    id: 'p4',
    number: '04',
    title: 'BossFitMama',
    subtitle: 'Yoga Coach Platform',
    description: 'Web-based fitness platform providing tailored yoga coaching and wellness resources for mothers.',
    tech: ['React', 'WordPress', 'LMS', 'Community'],
    role: 'Web Developer',
    url: 'https://bossfitmama.web.app/',
  }
];

export const ACCENT_COLORS: ColorScheme[] = [
  { name: 'Plasma Orange', hex: '#FF5F1F' },
  { name: 'Cyber Magenta', hex: '#FF00FF' },
  { name: 'Tron Cyan', hex: '#00F3FF' },
  { name: 'Laser Lemon', hex: '#E7FF00' },
  { name: 'Plasma Violet', hex: '#BD00FF' },
  { name: 'Matrix Green', hex: '#00FF41' }
];