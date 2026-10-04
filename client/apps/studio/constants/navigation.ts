export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface NavLogoConfig {
  src: string;
  alt: string;
  width: number;
  height: number;
  href: string;
}

export const NAV_LOGO: NavLogoConfig = {
  src: "/vectors/brand-logo.svg",
  alt: "diverxen",
  width: 116,
  height: 32,
  href: "/",
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/#services" },
  { label: "About us", href: "/#about" },
  { label: "Approach", href: "/#approach" },
  { label: "Contact", href: "/contact" },
];
