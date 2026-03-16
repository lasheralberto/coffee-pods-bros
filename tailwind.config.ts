import { heroui } from '@heroui/react';
import type { Config } from 'tailwindcss';
import { glopetHeroUITheme } from './src/theme.js';

const herouiThemeConfig = glopetHeroUITheme as unknown as Parameters<typeof heroui>[0];

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  plugins: [heroui(herouiThemeConfig)],
} satisfies Config;
