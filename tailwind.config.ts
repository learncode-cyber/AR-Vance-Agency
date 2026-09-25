import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom Colors - AR Vance Premium Brand
      colors: {
        // Primary Brand Navy
        navy: {
          50: '#F8F9FB',
          100: '#E8EEF7',
          200: '#D0DEEF',
          300: '#B8CEE7',
          400: '#8AAEDA',
          500: '#1A3A52', // Primary
          600: '#152E41',
          700: '#102330',
          800: '#0A1519',
          900: '#050A0F',
        },
        // Premium Gold Accent
        gold: {
          50: '#FFFBF0',
          100: '#FEF5E0',
          200: '#FDE8C0',
          300: '#FCDBA0',
          400: '#FBCE80',
          500: '#D4AF37', // Primary
          600: '#B39A2E',
          700: '#8B7424',
          800: '#63541B',
          900: '#3B3311',
        },
        // Emerald Green - Success
        emerald: {
          50: '#F0F9F9',
          100: '#D0F0F2',
          200: '#A1E0E6',
          300: '#72D0D9',
          400: '#42C0CD',
          500: '#0D7377', // Primary
          600: '#0A5A5F',
          700: '#074347',
          800: '#042B2F',
          900: '#021317',
        },
        // Neutral Palette - Eye Comfort
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#5A6B7D', // Secondary Text
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F1419', // Primary Text
        },
        // Light Mode Canvas
        canvas: '#F5F7FA',
        surface: '#FFFFFF',
        // Dark Mode Canvas
        'canvas-dark': '#0A0E13',
        'surface-dark': '#111820',
      },
      
      // Custom Fonts
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        display: ['Poppins', ...defaultTheme.fontFamily.sans],
        mono: ['Space Mono', ...defaultTheme.fontFamily.mono],
      },

      // Typography Scale
      fontSize: {
        'display-1': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        'display-2': ['36px', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-1': ['32px', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-2': ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-3': ['20px', { lineHeight: '1.5', fontWeight: '600' }],
        'heading-4': ['18px', { lineHeight: '1.5', fontWeight: '500' }],
        'body-lg': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-regular': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        'label': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
      },

      // Custom Shadows - Premium Elevation
      boxShadow: {
        'xs': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'sm': '0 3px 8px rgba(0, 0, 0, 0.06)',
        'md': '0 10px 25px rgba(0, 0, 0, 0.08)',
        'lg': '0 20px 40px rgba(0, 0, 0, 0.10)',
        'xl': '0 30px 60px rgba(0, 0, 0, 0.12)',
        'dark-md': '0 10px 25px rgba(0, 0, 0, 0.30)',
        'dark-lg': '0 20px 40px rgba(0, 0, 0, 0.40)',
      },

      // Border Radius
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },

      // Spacing (8px grid)
      spacing: {
        '0': '0',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },

      // Animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.7)' },
          '50%': { boxShadow: '0 0 0 10px rgba(212, 175, 55, 0)' },
        },
      },

      // Container Queries
      maxWidth: {
        'container': '1400px',
      },
    },
  },

  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config
