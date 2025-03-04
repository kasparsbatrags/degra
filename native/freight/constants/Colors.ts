const primary = '#161622';
const secondary = '#FF9C01';
const black100 = '#252536';
const black200 = '#2D2D45';
const gray100 = '#CDCDE0';
const highlight = '#3E7BFA';

export default {
  light: {
    text: '#000',
    background: '#fff',
    secondaryBackground: '#F5F5F5',
    tint: secondary,
    tabIconDefault: gray100,
    tabIconSelected: secondary,
    highlight: highlight,
  },
  dark: {
    text: '#fff',
    background: primary,
    secondaryBackground: black100,
    tint: secondary,
    tabIconDefault: gray100,
    tabIconSelected: secondary,
    highlight: highlight,
  },
} as const;
