export interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon: string;
  enabled: boolean;
}

/** Update these once official Miss Juicy Staxxx social URLs are confirmed. */
export const socials: SocialLink[] = [
  {
    id: "instagram",
    label: "Instagram",
    url: "https://instagram.com/",
    icon: "instagram",
    enabled: false,
  },
  {
    id: "x",
    label: "X",
    url: "https://twitter.com/",
    icon: "x",
    enabled: false,
  },
];

export function getEnabledSocials() {
  return socials.filter((s) => s.enabled);
}
