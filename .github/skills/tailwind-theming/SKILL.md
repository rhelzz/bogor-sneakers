---
name: tailwind-theming
description: "Tailwind CSS v4 configuration, theming, dark mode, and design tokens. Use when: setting up color themes, configuring responsive breakpoints, implementing dark mode, or customizing Tailwind config. Includes Bogor Sneakers brand-specific setup."
---

# Tailwind CSS v4 Configuration & Theming

## Bogor Sneakers: Brand Color Palette

Establish a consistent design system and color scheme:

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  theme: {
    extend: {
      // Brand colors
      colors: {
        // Bogor Sneakers Primary
        'primary': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Main primary
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c3d66',
        },
        // Secondary (accent)
        'accent': {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7', // Vibrant accent
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Neutral (grays)
        'neutral': {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Status colors
        'success': '#10b981',  // Green
        'warning': '#f59e0b',  // Amber
        'error': '#ef4444',    // Red
        'info': '#3b82f6',     // Blue
      },

      // Spacing
      spacing: {
        'xs': '0.25rem',   // 4px
        'sm': '0.5rem',    // 8px
        'md': '1rem',      // 16px
        'lg': '1.5rem',    // 24px
        'xl': '2rem',      // 32px
        '2xl': '3rem',     // 48px
        '3xl': '4rem',     // 64px
      },

      // Typography
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
      },

      fontFamily: {
        'sans': ['var(--font-sans)', 'system-ui', 'sans-serif'],
        'mono': ['var(--font-mono)', 'monospace'],
      },

      // Border radius
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',   // 4px
        'md': '0.5rem',    // 8px
        'lg': '0.75rem',   // 12px
        'xl': '1rem',      // 16px
        '2xl': '1.5rem',   // 24px
        'full': '9999px',
      },

      // Shadows
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        'product': '0 10px 30px rgba(0, 0, 0, 0.15)',
      },

      // Animation
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin': 'spin 1s linear infinite',
        'bounce': 'bounce 1s infinite',
        'shimmer': 'shimmer 2s infinite',
      },

      keyframes: {
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },

  plugins: [],
  darkMode: ['class'], // Class-based dark mode
}

export default config
```

## Dark Mode Implementation

### Step 1: Setup (already in config above)
```ts
darkMode: ['class']  // Toggle via <html class="dark">
```

### Step 2: Layout Setup
```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        {/* Your head content */}
      </head>
      <body className="bg-white text-black dark:bg-neutral-900 dark:text-white transition-colors">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

### Step 3: Theme Provider Component
```tsx
// components/theme-provider.tsx
'use client'

import { useEffect, useState } from 'react'

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check localStorage or system preference
    const isDarkMode = localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDark(isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  if (!mounted) return <>{children}</>

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark')
  }

  return (
    <>
      {children}
      {/* Theme toggle button in navbar */}
    </>
  )
}
```

### Step 4: Usage in Components
```tsx
// components/layout/TopNavbar.tsx
'use client'

import { Moon, Sun } from 'lucide-react'

export default function TopNavbar() {
  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark')
  }

  return (
    <nav className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          Bogor Sneakers
        </h1>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          <Sun className="h-5 w-5 text-gray-700 dark:hidden" />
          <Moon className="h-5 w-5 text-gray-300 hidden dark:block" />
        </button>
      </div>
    </nav>
  )
}
```

## Responsive Design Breakpoints

Tailwind v4 default breakpoints:

```
sm: 640px   → Mobile landscape
md: 768px   → Tablet
lg: 1024px  → Desktop
xl: 1280px  → Large desktop
2xl: 1536px → Extra large
```

### Mobile-First Pattern

```tsx
// Start WITH mobile, ADD complexity for larger screens
<div className="
  grid grid-cols-1    /* Mobile: 1 column */
  md:grid-cols-2      /* Tablet: 2 columns */
  lg:grid-cols-3      /* Desktop: 3 columns */
  gap-4
">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

## Common Tailwind Patterns for Bogor Sneakers

### Card Component
```tsx
<div className="
  bg-white dark:bg-neutral-800
  rounded-lg
  shadow-md hover:shadow-lg
  transition-shadow
  overflow-hidden
">
  {/* Content */}
</div>
```

### Button Variants
```tsx
// Primary
className="bg-primary-600 hover:bg-primary-700 text-white"

// Secondary
className="bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700"

// Ghost
className="bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800 text-primary-600"

// Disabled
className="opacity-50 cursor-not-allowed"
```

### Badge Variants
```tsx
// Success
className="bg-success bg-opacity-10 text-success"

// Warning
className="bg-warning bg-opacity-10 text-warning"

// Error
className="bg-error bg-opacity-10 text-error"
```

### Loading Skeleton (Shimmer Effect)
```tsx
<div className="
  bg-gradient-to-r from-gray-200 to-gray-100
  dark:from-neutral-700 dark:to-neutral-600
  animate-shimmer
  h-4 rounded
  w-3/4
" />
```

### Focus & Accessibility
```tsx
className="
  focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
  focus-visible:outline-none
" 
```

### Motion Reduce Support
```tsx
className="
  transition-all duration-300
  motion-reduce:transition-none
"
```

## Container Queries (Tailwind v4+)

For components that adapt to their parent container size:

```tsx
<div className="@container">
  <div className="
    grid grid-cols-1
    @md:grid-cols-2     /* When container > medium */
    @lg:grid-cols-3     /* When container > large */
  ">
    {/* Items */}
  </div>
</div>
```

## Advanced: Custom Utility Classes

For specific Bogor Sneakers patterns:

```css
/* src/styles/globals.css */
@layer components {
  .shoe-card {
    @apply relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer;
  }

  .shoe-card-image {
    @apply w-full h-64 object-cover;
  }

  .price-badge {
    @apply absolute top-3 right-3 bg-primary-600 text-white px-3 py-1 rounded-lg font-semibold;
  }

  .btn-primary {
    @apply px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .input-base {
    @apply w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800 dark:text-white;
  }
}
```

## Performance Optimization

### Purge CSS (automatic in Next.js)
Tailwind automatically removes unused styles in production.

### CDN vs Local
```ts
// Use local Tailwind CSS for best performance
import Tailwind via @tailwindcss/postcss (already configured)
```

### Critical CSS
Next.js App Router automatically extracts critical CSS for above-the-fold content.

## Dark Mode Testing Checklist

```
□ All colors have dark: variants defined
□ Contrast ratios maintained in dark mode (4.5:1)
□ Images visible in both modes
□ No hardcoded colors in components
□ Modal overlays readable in dark mode
□ Focus indicators visible in dark mode
□ Tested with prefers-color-scheme: dark
```

## Debugging Tailwind

### Common Issues

**Classes not applying:**
```
1. Check content: [] in tailwind.config.ts includes your files
2. Clear .next/ cache: rm -rf .next/
3. Restart dev server: npm run dev
4. Verify class names match Tailwind (no typos)
```

**Specificity conflicts:**
```
Use !important sparingly or restructure component hierarchy
Prefer Tailwind classes over custom CSS
```

**Performance warning:**
```
Check for class names generated dynamically:
❌ className={`text-${color}-500`}  // Tailwind won't scan
✓ Use object mapping instead
```

---

**Next:** Check Performance Optimization skill for bundle and image optimization.
