
import type {Config} from 'tailwindcss';

// Harmless comment to invalidate build cache and fix ENOENT error.
export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem", // 16px
      screens: {
        sm: "600px",
        md: "834px",
        lg: "1024px",
        xl: "1120px",
      },
    },
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Space Grotesk', 'sans-serif'],
        code: ['Inter', 'monospace'],
      },
      fontSize: {
        'h1': ['24px', '32px'],
        'h2': ['20px', '28px'],
        'h3': ['18px', '26px'],
        'body': ['16px', '24px'],
        'caption': ['12px', '18px'],
        'numeric-xl': ['32px', '36px'],
        'numeric-l': ['24px', '28px'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          dark: 'hsl(var(--primary-dark))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        'ink-900': '#1C1F28',
        'ink-700': '#2C2C2C',
        'ink-500': '#6B7280',
        'ink-300': '#A0A4A8',
        'line-200': '#E6E9EE',
        'line-300': '#D6DAE1',
        'brand-deep-teal': '#0E6B64',
        'brand-accent-orange': '#F37E2C',
        'score-good': '#27AE60',
        'fair': 'hsl(var(--fair))',
        'score-poor': '#EB5757',
        'score-bad': 'hsl(var(--score-bad))',
        'score-fair': 'hsl(var(--score-fair))',
        'score-great': 'hsl(var(--score-great))',
        'score-excellent': 'hsl(var(--score-excellent))',
        alert: 'hsl(var(--destructive))',
        panel: 'hsl(var(--panel))',
      },
      borderRadius: {
        'xl': '1.25rem', // 20px
        'lg': '1rem', // 16px
        'md': '0.75rem', // 12px
        'sm': 'calc(var(--radius) - 4px)',
        'full': '999px',
        'onboarding': '14px',
      },
      boxShadow: {
        'card': '0 8px 24px rgba(28,31,40,0.08)',
        'floating': '0 12px 32px rgba(28,31,40,0.14)',
        'onboarding-cta': '0 8px 24px rgba(28,31,40,0.12)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
