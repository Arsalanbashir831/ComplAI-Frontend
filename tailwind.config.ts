import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Authority SelectTrigger colors (SRA, LAA, AML, default)
    '!text-yellow-700',
    '!bg-yellow-50',
    'hover:!bg-yellow-100',
    'focus:!bg-yellow-100',
    '!border-yellow-300',
    '!text-green-700',
    '!bg-green-50',
    'hover:!bg-green-100',
    'focus:!bg-green-100',
    '!border-green-300',
    '!text-cyan-700',
    '!bg-cyan-50',
    'hover:!bg-cyan-100',
    'focus:!bg-cyan-100',
    '!border-cyan-300',
    '!text-gray-600',
    '!bg-gray-200',
    'hover:!bg-gray-300',
    'focus:!bg-gray-100',
    '!border-gray-300',
    // Authority SelectItem hover/focus/checked states (SRA)
    'hover:!bg-yellow-50',
    'focus:!bg-yellow-50',
    'focus:!text-yellow-700',
    'data-[state=checked]:!bg-yellow-100',
    'data-[state=checked]:!text-yellow-700',
    // Authority SelectItem hover/focus/checked states (LAA)
    'hover:!bg-green-50',
    'focus:!bg-green-50',
    'focus:!text-green-700',
    'data-[state=checked]:!bg-green-100',
    'data-[state=checked]:!text-green-700',
    // Authority SelectItem hover/focus/checked states (AML)
    'hover:!bg-cyan-50',
    'focus:!bg-cyan-50',
    'focus:!text-cyan-700',
    'data-[state=checked]:!bg-cyan-100',
    'data-[state=checked]:!text-cyan-700',
    // Authority SelectItem hover/focus states (default)
    'hover:!bg-gray-50',
    'focus:!bg-gray-50',
    // Authority text colors
    'text-yellow-700',
    'text-green-700',
    'text-cyan-700',
    'text-blue-800',
  ],
  theme: {
    extend: {
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
          DEFAULT: 'hsla(var(--primary))',
          foreground: 'hsla(var(--primary-foreground))',
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
        gray: {
          light: 'hsl(var(--gray-light))',
          dark: 'hsl(var(--gray-dark))',
        },
        blue: {
          dark: 'hsl(var(--blue-dark))',
          light: 'hsl(var(--blue-light))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' },
        },
        'fade-in-bottom': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out-bottom': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(20px)' },
        },
      },
      animation: {
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
        'fade-in-bottom': 'fade-in-bottom 1s ease-out forwards',
        'fade-out-bottom': 'fade-out-bottom 1s ease-out forwards',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
