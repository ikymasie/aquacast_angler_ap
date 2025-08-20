import type {Config} from 'tailwindcss';

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
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Space Grotesk', 'sans-serif'],
        code: ['var(--font-inter)', 'monospace'], // Using Inter for tabular nums
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
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        nav: {
            DEFAULT: 'hsl(var(--nav-background))',
            background: 'hsl(var(--nav-background))',
            foreground: 'hsl(var(--nav-foreground))',
        },
        good: 'hsl(var(--success))',
        fair: 'hsl(var(--fair))',
        poor: 'hsl(var(--poor))',
        alert: 'hsl(var(--destructive))',
        panel: 'hsl(var(--nav-background))', // Alias for panel color
        ink: {
          '900': '#1C1F28',
          '700': '#2C2C2C',
          '500': '#6B7280',
          '300': '#A0A4A8'
        },
        teal: {
            '500': '#3CC7B7',
            '600': '#2DB1A2',
            '100': '#D9F1EE'
        },
        line: {
            '200': '#E6E9EE',
            '300': '#D6DAE1'
        }
      },
      borderRadius: {
        lg: 'var(--radius)', // 16px
        xl: '1.25rem', // 20px
        md: '0.75rem', // 12px
        sm: 'calc(var(--radius) - 4px)', // fallback
        full: '999px',
      },
      boxShadow: {
        'card': '0 8px 24px rgba(28,31,40,0.08)',
        'floating': '0 12px 32px rgba(28,31,40,0.14)',
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
