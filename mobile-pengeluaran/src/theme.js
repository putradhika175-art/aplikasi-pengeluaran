export const Colors = {
  primary: '#005C55', // Teal utama dari Stitch
  primaryLight: '#0F766E',
  primaryContainer: '#9CF2E8',
  primaryBg: '#E6FFFA',
  secondary: '#006B5F',
  secondaryContainer: '#6DF5E1',
  background: '#FAF8FF',
  surface: '#FFFFFF',
  surfaceLow: '#F2F3FF',
  surfaceHigh: '#E2E7FF',
  text: '#131B2E',
  textSecondary: '#3E4947',
  textMuted: '#6E7977',
  border: '#CBD5E1',
  borderLight: '#E2E8F0',
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  errorText: '#93000A',
  white: '#FFFFFF',
};

export const CategoryConfig = {
  Makanan: {
    icon: 'restaurant',
    color: '#D97706',
    bgColor: '#FEF3C7',
    badgeBg: '#FFDDB8',
    badgeText: '#653E00',
    subtitle: 'Kuliner & resto',
  },
  Transport: {
    icon: 'car-sport',
    color: '#0284C7',
    bgColor: '#E0F2FE',
    badgeBg: '#71F8E4',
    badgeText: '#005048',
    subtitle: 'Bensin, tarif',
  },
  Pendidikan: {
    icon: 'book',
    color: '#7E22CE',
    bgColor: '#F3E8FF',
    badgeBg: '#9CF2E8',
    badgeText: '#00504A',
    subtitle: 'Buku, kursus',
  },
  Hiburan: {
    icon: 'game-controller',
    color: '#059669',
    bgColor: '#D1FAE5',
    badgeBg: '#E2E7FF',
    badgeText: '#131B2E',
    subtitle: 'Film, hobi',
  },
  'Tanpa kategori': {
    icon: 'options-outline',
    color: '#64748B',
    bgColor: '#F1F5F9',
    badgeBg: '#E2E8F0',
    badgeText: '#334155',
    subtitle: 'Pengeluaran umum harian',
  },
};

export function getCategoryInfo(name) {
  if (!name) return CategoryConfig['Tanpa kategori'];
  const matchedKey = Object.keys(CategoryConfig).find(
    (key) => key.toLowerCase() === String(name).toLowerCase()
  );
  return matchedKey ? CategoryConfig[matchedKey] : CategoryConfig['Tanpa kategori'];
}
