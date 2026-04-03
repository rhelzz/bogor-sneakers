---
name: performance-optimization
description: "Performance profiling, image optimization, code splitting, and bundle analysis. Use when: optimizing page load speed, analyzing bundle size, implementing lazy loading, or reducing Core Web Vitals. Includes Next.js 16 and Turbopack best practices."
---

# Frontend Performance Optimization

## Core Web Vitals Optimization (Next.js 16)

### Key Metrics to Track

| Metric | Target | Impact |
|--------|--------|--------|
| **LCP** (Largest Contentful Paint) | < 2.5s | User perceives page loaded |
| **INP** (Interaction to Next Paint) | < 200ms | Page responsiveness |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Visual stability |
| **FCP** (First Contentful Paint) | < 1.8s | First paint appearance |
| **TTFB** (Time to First Byte) | < 600ms | Server response speed |

### Quick Performance Audit
```bash
# Install Web Vitals
npm install web-vitals

# Measure in your app
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)
```

## Image Optimization (Highest Impact)

### Next.js Image Component (Already Best Practice)

```tsx
// ✓ CORRECT - Uses next/image
import Image from 'next/image'

export default function ProductShowcase() {
  return (
    <Image
      src="/sneaker-showcase.jpg"
      alt="Premium Bogor Custom Sneaker"
      width={800}
      height={600}
      priority={true}        // For above-the-fold images (LCP)
      loading="lazy"         // Default for below-the-fold
      placeholder="blur"     // Blur placeholder while loading
      sizes="(max-width: 768px) 100vw, 800px"  // Responsive
      className="w-full h-auto rounded-lg"
    />
  )
}
```

### Responsive Image Sizes
```tsx
// For product cards on different screen sizes
<Image
  src={product.image}
  alt={product.name}
  width={400}
  height={400}
  sizes="
    (max-width: 640px) 100vw,    /* Mobile: full width */
    (max-width: 1024px) 50vw,    /* Tablet: half width */
    33vw                          /* Desktop: third width */
  "
/>
```

### Image Format Strategy
```
Original: JPG/PNG
↓
Next.js automatically serves:
  - WebP for modern browsers (30% smaller)
  - AVIF for cutting-edge browsers (20% smaller than WebP)
  - Fallback JPG/PNG for older browsers
```

### Bogor Sneakers Image Optimization Strategy

```tsx
// lib/image-helpers.ts
export const PRODUCT_IMAGE_SIZES = {
  catalog: "sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'",
  hero: "sizes='100vw'",
  thumbnail: "sizes='(max-width: 640px) 80px, 120px'",
} as const

// components/features/catalog/ProductCard.tsx
<Image
  src={product.image}
  alt={`${product.name} - Size ${product.size}`}
  width={300}
  height={300}
  placeholder="blur"
  priority={index < 3}  // Load first 3 eagerly
  sizes={PRODUCT_IMAGE_SIZES.catalog}
  className="w-full h-64 object-cover"
/>
```

## Code Splitting & Dynamic Imports

### Route-Based Code Splitting (Automatic in Next.js)
```
Each page route automatically gets its own bundle
✓ pages/catalog/page.tsx → Creates separate chunk
✓ pages/customize/page.tsx → Creates separate chunk
→ Only load what's needed per page
```

### Component-Level Code Splitting (Dynamic Imports)
```tsx
// components/features/customize/GymShoePreview.tsx - Heavy component
import dynamic from 'next/dynamic'

const CustomizeViewer = dynamic(() => import('@/components/GymShoePreview'), {
  loading: () => (
    <div className="h-96 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded-lg flex items-center justify-center">
      <span className="text-gray-500">Loading preview...</span>
    </div>
  ),
  ssr: false,  // Skip server-side rendering if uses browser APIs
})

export default function CustomizePage() {
  return (
    <div>
      <CustomizeViewer />
    </div>
  )
}
```

### Library Code Splitting
```tsx
// Framer Motion is already used - it's bundled but async-loaded when needed
import { motion } from 'framer-motion'

export default function AnimatedCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Content */}
    </motion.div>
  )
}
```

## Bundle Analysis (Turbopack in Next.js 16)

### Enable Bundle Analyzer
```bash
# Next.js 16.1+ has experimental bundle analyzer
npm install @next/bundle-analyzer --save-dev
```

```ts
// next.config.ts
import withBundleAnalyzer from '@next/bundle-analyzer'

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withAnalyzer({
  // Your Next.js config
})
```

### Run Analysis
```bash
# Analyze bundle
ANALYZE=true npm run build

# View interactive visualization
# Open .next/bundle-analyzer/
```

### Bundle Size Optimization Checklist

```
□ Large dependencies use dynamic imports
  - Heavy UI libraries (Shadcn, Framer Motion)
  - Charting libraries
  - Rich text editors

□ Remove unused dependencies
  npm npm audit
  npm npm ls (see dependency tree)

□ Combine multiple small utilities
  Don't: import from 10 different utility files
  Do: Import utilities from centralized /lib/utils.ts

□ Tree-shake unused exports
  Use named imports: import { Button } from './ui'
  Don't: import * as ui from './ui'

□ Minimize CSS
  Tailwind automatically purges unused classes

□ Defer non-critical JavaScript
  Non-critical analytics, tracking pixels
```

## Font Optimization

### System Fonts (Fastest)
```tsx
// tailwind.config.ts
theme: {
  fontFamily: {
    sans: [
      'system-ui',
      'ui-rounded',
      'Hiragino Maru Gothic',
      'Quicksand',
      {
        '@supports (font-variation-settings: normal)': {
          fontFeatureSettings: 'normal',
        },
      },
    ],
  },
}
```

### Google Fonts (If needed for branding)
```tsx
// app/layout.tsx
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html className={poppins.variable}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

### Font Display Strategy
```tsx
// next/font optimizes font loading automatically
// font-display: swap ensures text visible immediately
// Font loads in background
```

## Server-Side Rendering (SSR) Optimization

### Streaming with Suspense
```tsx
// app/catalog/page.tsx
import { Suspense } from 'react'
import CatalogGrid from '@/components/features/catalog/CatalogGrid'
import CatalogSkeleton from '@/components/features/catalog/CatalogSkeleton'

export default function CatalogPage() {
  return (
    <div>
      <h1>Shop All Sneakers</h1>
      
      {/* Render quickly, load data in background */}
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogGrid />
      </Suspense>
    </div>
  )
}

// components/features/catalog/CatalogGrid.tsx (Server Component)
async function CatalogGrid() {
  // Fetch data on server - avoid client-side waterfall
  const products = await getProducts()
  
  return (
    <div className="grid gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

## Database Query Optimization

### N+1 Query Prevention
```ts
// ❌ BAD - N+1: Fetches 1 product, then 100 reviews each
const product = await db.product.findById(id)
const reviews = await db.review.findMany({ productId: id })

// ✓ GOOD - Single query with Join
const product = await db.product.findById(id, {
  include: { reviews: true }
})

// ✓ BETTER - Select only needed columns
const products = await db.product.findMany({
  select: {
    id: true,
    name: true,
    price: true,
    image: true,
  },
  take: 20,
})
```

### Caching Fetched Data
```tsx
// lib/api/products.ts
import { cache } from 'react'

// Cache results per request (revalidates on new request)
export const getProducts = cache(async (page: number = 1) => {
  const response = await fetch(`/api/products?page=${page}`, {
    next: { revalidate: 3600 }, // ISR: revalidate every hour
  })
  return response.json()
})

// Usage in multiple components - only fetches once per request
```

## Client-Side Performance

### Avoid useEffect for Data Fetching
```tsx
// ❌ AVOID - Causes waterfall + extra renders
'use client'
import { useEffect, useState } from 'react'

export default function ProductList() {
  const [products, setProducts] = useState([])
  
  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts)
  }, [])
  
  return <div>{/* render products */}</div>
}

// ✓ DO - Server Component fetches directly
export default async function ProductList() {
  const products = await fetch('/api/products').then(r => r.json())
  return <div>{/* render products */}</div>
}
```

### Debounce Heavy Operations
```tsx
// hooks/useDebounce.ts
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delayMs)
    return () => clearTimeout(handler)
  }, [value, delayMs])
  
  return debouncedValue
}

// Usage in search
'use client'
import { useState } from 'react'
import { useDebounce } from '@/lib/hooks'

export default function SearchProducts() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  
  // Fetch only after user stops typing for 300ms
  return (
    <input
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

## Next.js 16 Turbopack Performance

### Turbopack Already Enabled
```
✓ Development: Automatic with next dev
✓ Production: Stable (next build)
✓ Benefits:
  - 400% faster startup
  - 50% faster rendering
  - File system caching
```

### Development Server
```bash
# Already using Turbopack by default
npm run dev

# Explicit Turbopack flag (if not default)
next dev --turbo

# Disable if issues
next dev --no-turbo
```

## Performance Monitoring Setup

### Real User Monitoring (RUM)
```tsx
// lib/analytics/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export function initWebVitals() {
  getCLS(sendMetric)
  getFID(sendMetric)
  getFCP(sendMetric)
  getLCP(sendMetric)
  getTTFB(sendMetric)
}

function sendMetric(metric: any) {
  // Send to analytics service
  console.log(`${metric.name}: ${metric.value}ms`)
}
```

### Page Speed Insights Integration
```bash
# Use Google PageSpeed Insights
# https://pagespeed.web.dev/

# Or Lighthouse CI
npm install --save-dev @lhci/cli@latest
```

## Performance Audit Checklist

```
✓ Images
  □ Using next/image for all images
  □ Setting width/height to prevent CLS
  □ Using placeholder="blur" for LCP
  □ Responsive sizes configured
  □ WebP/AVIF formats

✓ Code Splitting
  □ Dynamic imports for heavy components
  □ Route-based code splitting working
  □ No unused dependencies

✓ Bundle Size
  □ Analyzed with bundle analyzer
  □ Tree-shaking enabled
  □ No duplicate dependencies

✓ Caching
  □ Using revalidation on data fetches
  □ ISR/SSR properly configured
  □ Static content cached

✓ Fonts
  □ Using system fonts or next/font
  □ font-display: swap configured
  □ Minimal font weights

✓ Rendering
  □ Server components by default
  □ useEffect data fetching eliminated
  □ Suspense boundaries for streaming

✓ Core Web Vitals
  □ LCP < 2.5s
  □ INP < 200ms
  □ CLS < 0.1
```

---

**Next:** Check Accessibility Audit skill for WCAG compliance testing.
