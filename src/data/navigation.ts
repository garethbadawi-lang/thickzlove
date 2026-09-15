export interface NavItem {
  label: string;
  href: string;
}

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Availability", href: "/availability" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Booking", href: "/booking" },
];

export const footerNav: NavItem[] = [
  ...mainNav,
  { label: "Etiquette", href: "/etiquette" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];
