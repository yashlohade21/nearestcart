// Dalla Deal Tracker — Design Tokens
export const Colors = {
  // Primary
  green: "#059669",
  greenLight: "#d1fae5",
  greenBg: "#f0fdf4",

  // Danger / Payable
  red: "#dc2626",
  redLight: "#fee2e2",
  redBg: "#fef2f2",

  // Warning / Overdue
  amber: "#f59e0b",
  amberLight: "#fef3c7",

  // Neutrals
  white: "#ffffff",
  bg: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",
  borderLight: "#f1f5f9",
  text: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  textWhite: "#ffffff",

  // Misc
  shadow: "#000000",
};

export const Fonts = {
  xs: 14,
  sm: 15,
  base: 16,
  lg: 18,
  xl: 22,
  "2xl": 26,
  "3xl": 32,
  "4xl": 38,
};

// Minimum touch target sizes (48x48 per accessibility guidelines)
export const TouchTarget = {
  minHeight: 48,
  minWidth: 48,
};

// Product emoji map for visual identification
export const ProductEmojis: Record<string, string> = {
  // Grains & Cereals
  wheat: "🌾",
  rice: "🍚",
  corn: "🌽",
  maize: "🌽",
  bajra: "🌾",
  jowar: "🌾",
  ragi: "🌾",
  barley: "🌾",
  oats: "🌾",

  // Vegetables
  tomato: "🍅",
  onion: "🧅",
  potato: "🥔",
  garlic: "🧄",
  ginger: "🫚",
  chilli: "🌶️",
  pepper: "🌶️",
  brinjal: "🍆",
  eggplant: "🍆",
  cabbage: "🥬",
  cauliflower: "🥦",
  carrot: "🥕",
  peas: "🫛",
  beans: "🫘",
  okra: "🫑",
  ladyfinger: "🫑",
  spinach: "🥬",
  palak: "🥬",
  cucumber: "🥒",
  pumpkin: "🎃",

  // Fruits
  apple: "🍎",
  banana: "🍌",
  mango: "🥭",
  orange: "🍊",
  grape: "🍇",
  watermelon: "🍉",
  pomegranate: "🫐",
  papaya: "🍈",
  guava: "🍐",
  lemon: "🍋",
  coconut: "🥥",
  pineapple: "🍍",

  // Cash Crops
  cotton: "🏵️",
  kapas: "🏵️",
  sugarcane: "🎋",
  ganna: "🎋",
  soybean: "🫘",
  groundnut: "🥜",
  peanut: "🥜",
  mustard: "🌻",
  sunflower: "🌻",
  jute: "🧶",
  tobacco: "🍂",
  tea: "🍵",
  coffee: "☕",

  // Spices
  turmeric: "🟡",
  haldi: "🟡",
  cumin: "🟤",
  jeera: "🟤",
  coriander: "🌿",
  dhaniya: "🌿",
  cardamom: "🟢",
  elaichi: "🟢",
  clove: "🟤",

  // Pulses
  dal: "🫘",
  chana: "🫘",
  moong: "🫘",
  urad: "🫘",
  toor: "🫘",
  masoor: "🫘",
  lentil: "🫘",

  // Dairy/Animal
  milk: "🥛",
  ghee: "🧈",
};

export function getProductEmoji(name: string): string {
  const lower = name.toLowerCase().trim();
  // Direct match
  if (ProductEmojis[lower]) return ProductEmojis[lower];
  // Partial match
  for (const [key, emoji] of Object.entries(ProductEmojis)) {
    if (lower.includes(key) || key.includes(lower)) return emoji;
  }
  return "📦";
}
