const primary = '#161622';
const secondary = '#FF9C01';
const black100 = '#1E1E2D';
const gray100 = '#CDCDE0';

export default {
  light: {
    text: '#000',
    background: '#fff',
    secondaryBackground: '#F5F5F5',
    tint: secondary,
    tabIconDefault: gray100,
    tabIconSelected: secondary,
  },
  dark: {
    text: '#fff',
    background: primary,
    secondaryBackground: black100,
    tint: secondary,
    tabIconDefault: gray100,
    tabIconSelected: secondary,
  },
} as const;
