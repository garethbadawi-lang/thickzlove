export interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon: string;
  enabled: boolean;
}

/** Official Love Z Thick social, tip, and content links. */
export const socials: SocialLink[] = [
  {
    id: "onlyfans-vip",
    label: "VIP",
    url: "https://onlyfans.com/Thickzlove912",
    icon: "onlyfans",
    enabled: true,
  },
  {
    id: "onlyfans-free",
    label: "FREE",
    url: "https://onlyfans.com/thickzlovefree",
    icon: "onlyfans",
    enabled: true,
  },
  {
    id: "x",
    label: "X",
    url: "https://x.com/ZLOVE_theGOAT",
    icon: "x",
    enabled: true,
  },
  {
    id: "telegram",
    label: "Telegram",
    url: "https://t.me/thickzlove",
    icon: "telegram",
    enabled: true,
  },
  {
    id: "cashapp",
    label: "Cash App",
    url: "https://cash.app/$thickzlov3",
    icon: "cashapp",
    enabled: true,
  },
  {
    id: "venmo",
    label: "Venmo",
    url: "https://venmo.com/thickzlove94",
    icon: "venmo-v",
    enabled: true,
  },
  {
    id: "xvideos",
    label: "XVIDS",
    url: "https://www.xvideos.com/amateur-channels/thickzlove",
    icon: "xvideos-x",
    enabled: true,
  },
  {
    id: "pornhub",
    label: "PHUB ❤️",
    url: "https://www.pornhub.com/pornstar/thick-z-love",
    icon: "pornhub-ph",
    enabled: true,
  },
];

export function getEnabledSocials() {
  return socials.filter((s) => s.enabled);
}
