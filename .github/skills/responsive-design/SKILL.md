---
name: responsive-design
description: "Mobile-first responsive design patterns and breakpoint strategy. Use when: building layouts that work across devices, testing responsive behavior, or designing mobile-optimized pages. Includes Bogor Sneakers mobile-first patterns with Tailwind breakpoints."
---

# Mobile-First Responsive Design Checklist

## Mobile-First Philosophy

```
START with mobile (340px) → Add complexity for larger screens
NOT: Build desktop first, then squash down

Benefits:
✓ Smaller CSS by default
✓ Better performance on mobile
✓ Forces prioritization of essential content
✓ Progressive enhancement
```

## Tailwind Breakpoints (Default)

```
Base (mobile):  0px - 639px
sm:             640px+ (mobile landscape)
md:             768px+ (tablet)
lg:             1024px+ (desktop)
xl:             1280px+ (large desktop)
2xl:            1536px+ (extra large)
```

### Bogor Sneakers Breakpoint Strategy

```
Mobile (340px):     Core shopping experience
Tablet (768px):     Grid layouts, larger thumbnails
Desktop (1024px):   Full catalog, side navigation
Large (1280px):     Premium showcase, full customizer
```

## Mobile-First Grid Example

```tsx
// ✓ CORRECT - Mobile first
<div className="
  grid grid-cols-1           /* Mobile: 1 column */
  sm:grid-cols-2             /* Mobile landscape: 2 */
  md:grid-cols-2             /* Tablet: 2 */
  lg:grid-cols-3             /* Desktop: 3 */
  xl:grid-cols-4             /* Large: 4 */
  gap-4
">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>

// ❌ WRONG - Desktop first (add breakdowns)
<div className="grid grid-cols-4 lg:grid-cols-1">
  {/* Only mobile looks good, large screens better */}
</div>
```

## Common Responsive Patterns

### Hero Section
```tsx
export default function HeroSection() {
  return (
    <section className="
      relative
      h-screen              /* Full viewport height */
      md:h-96               /* Shorter on tablet */
      lg:min-h-screen       /* Full again on desktop */
      bg-gradient-to-r from-primary-600 to-accent-600
      flex items-center justify-center
    ">
      <div className="
        max-w-4xl mx-auto px-4
        text-center
        space-y-4
      ">
        <h1 className="
          text-3xl font-bold
          md:text-4xl
          lg:text-5xl
          text-white
        ">
          Custom Sneaker Design
        </h1>
        
        <p className="
          text-base
          md:text-lg
          lg:text-xl
          text-white text-opacity-90
          max-w-2xl mx-auto
        ">
          Create your perfect shoe with AI-powered design tools
        </p>
        
        <button className="
          px-6 py-3
          md:px-8 md:py-4
          lg:px-10 lg:py-5
          bg-white text-primary-600
          rounded-lg font-semibold
          hover:shadow-lg transition-shadow
          text-sm md:text-base lg:text-lg
        ">
          Start Designing
        </button>
      </div>
    </section>
  )
}
```

### Product Catalog Grid
```tsx
export default function CatalogPage() {
  return (
    <div className="
      max-w-7xl mx-auto
      px-4 md:px-6 lg:px-8  /* Responsive padding */
      py-8 md:py-12 lg:py-16 /* Responsive vertical */
    ">
      <h1 className="
        text-2xl md:text-3xl lg:text-4xl
        font-bold mb-8
      ">
        Shop All Sneakers
      </h1>

      {/* Filter sidebar - appears below on mobile, left on desktop */}
      <div className="
        flex flex-col
        lg:flex-row
        gap-6 lg:gap-10
      ">
        {/* Filters - full width mobile, sidebar desktop */}
        <aside className="
          w-full lg:w-64
          flex-shrink-0
        ">
          <FilterPanel />
        </aside>

        {/* Product grid */}
        <main className="
          flex-1
          min-w-0
        ">
          <div className="
            grid grid-cols-2       /* 2 columns mobile */
            md:grid-cols-2         /* 2 columns tablet */
            lg:grid-cols-3         /* 3 columns desktop */
            xl:grid-cols-4         /* 4 columns large */
            gap-3 md:gap-4 lg:gap-6
          ">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
```

### Navigation Bar
```tsx
'use client'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function TopNavbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="
          flex justify-between items-center
          h-16 md:h-20       /* Adjust nav height */
        ">
          {/* Logo */}
          <h1 className="
            text-xl md:text-2xl lg:text-3xl
            font-bold text-primary-600
          ">
            Bogor
          </h1>

          {/* Desktop Navigation - hidden on mobile */}
          <ul className="
            hidden
            md:flex            /* Show on tablet+ */
            gap-4 lg:gap-8
            text-sm md:text-base
          ">
            <li><a href="/catalog">Shop</a></li>
            <li><a href="/customize">Customize</a></li>
            <li><a href="/cart">Cart</a></li>
          </ul>

          {/* Mobile Menu Button - visible on mobile only */}
          <button
            className="
              md:hidden           /* Hide on tablet+ */
              p-2
              hover:bg-gray-100
              rounded-lg
            "
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu - expands below navbar */}
        {isOpen && (
          <ul className="
            md:hidden           /* Hide on tablet+ */
            pb-4
            space-y-2
            text-sm
          ">
            <li><a href="/catalog">Shop</a></li>
            <li><a href="/customize">Customize</a></li>
            <li><a href="/cart">Cart</a></li>
          </ul>
        )}
      </div>
    </nav>
  )
}
```

### Checkout Form
```tsx
export default function CheckoutPage() {
  return (
    <div className="
      grid grid-cols-1       /* Mobile: single column */
      lg:grid-cols-3         /* Desktop: 2/3 + 1/3 sidebar */
      gap-8 lg:gap-12
      max-w-7xl mx-auto
      px-4 md:px-6 lg:px-8
      py-8 md:py-12 lg:py-16
    ">
      {/* Form - 2/3 width on desktop, full on mobile */}
      <div className="lg:col-span-2">
        <h1 className="
          text-2xl md:text-3xl
          font-bold mb-6
        ">
          Shipping Information
        </h1>
        <form className="space-y-4 md:space-y-6">
          {/* Form fields */}
          <div>
            <label>Email</label>
            <input type="email" className="
              w-full
              px-3 md:px-4 py-2 md:py-3
              border rounded-lg
              focus:ring-2 focus:ring-primary-500
              text-sm md:text-base
            " />
          </div>
          {/* More fields... */}
        </form>
      </div>

      {/* Order Summary - 1/3 on desktop, full mobile */}
      <aside className="lg:sticky lg:top-4 lg:max-h-screen">
        <div className="
          border rounded-lg
          p-4 md:p-6
          bg-gray-50
          md:text-sm lg:text-base
        ">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          {/* Summary items */}
        </div>
      </aside>
    </div>
  )
}
```

## Responsive Images & Media

### Picture Element for Art Direction
```tsx
// Different images at different breakpoints
<picture>
  <source media="(max-width: 768px)" srcSet="/shoe-mobile.jpg" />
  <source media="(min-width: 769px)" srcSet="/shoe-desktop.jpg" />
  <img
    src="/shoe-desktop.jpg"
    alt="Premium custom sneaker"
    className="w-full h-auto"
  />
</picture>

// Or with next/image
<Image
  src={isMobile ? '/shoe-mobile.jpg' : '/shoe-desktop.jpg'}
  alt="Premium custom sneaker"
  width={isMobile ? 400 : 800}
  height={isMobile ? 400 : 600}
  responsive
/>
```

### Responsive Padding/Gap
```tsx
// Padding increases with screen size
<div className="
  px-4 sm:px-6 md:px-8 lg:px-12
  py-6 md:py-8 lg:py-12
">
  Content
</div>

// Gap between grid items
<div className="
  grid gap-3       /* Mobile: small gap */
  sm:gap-4
  md:gap-6         /* Desktop: larger gap */
  lg:gap-8
">
  Items
</div>
```

## Font Sizes (Responsive Typography)

```tsx
// Text size increases with screen
<h1 className="
  text-2xl        /* Mobile: 24px */
  sm:text-3xl
  md:text-4xl
  lg:text-5xl     /* Desktop: 48px */
  font-bold
">
  Heading
</h1>

<p className="
  text-sm         /* Mobile: 14px */
  md:text-base
  lg:text-lg      /* Desktop: 18px */
  leading-relaxed
">
  Paragraph
</p>
```

## Testing Responsive Design

### Browser DevTools
```
Chrome/Firefox:
1. F12 to open DevTools
2. Ctrl+Shift+M (or toggle device toolbar)
3. Test at different screen sizes
4. Rotate viewport to landscape
```

### Test Sizes (Minimum Recommendations)
```
□ 340px   (iPhone SE)
□ 375px   (iPhone 12/13)
□ 425px   (iPad Mini)
□ 768px   (iPad/Tablet)
□ 1024px  (iPad Pro / Small Laptop)
□ 1440px  (Desktop)
□ 1920px  (Large Desktop)
```

### Manual Testing Checklist
```
Mobile (375px)
□ Layout single column
□ Touch targets ≥ 48px
□ Horizontal scroll? None
□ Text readable without zoom
□ Images properly sized

Tablet (768px)
□ Sidebar appears (if any)
□ 2-column layout works
□ Typography readable
□ No orphaned content

Desktop (1024px+)
□ Multi-column layout
□ Desktop navigation works
□ Full feature set accessible
□ Good use of whitespace
```

## Container Queries (Advanced)

Respond to parent container size, not viewport:

```tsx
'use client'

// Component sized by parent, not viewport
export default function ResponsiveCard() {
  return (
    <div className="@container">
      <div className="
        grid grid-cols-1
        @sm:grid-cols-2      /* When container > small */
        @md:grid-cols-3      /* When container > medium */
      ">
        {items.map(item => (
          <div key={item.id}>{/* content */}</div>
        ))}
      </div>
    </div>
  )
}

// Parent decides size
<div className="w-full">
  <ResponsiveCard />
</div>

<div className="w-80">
  <ResponsiveCard />  {/* Becomes 1 column in narrow space */}
</div>
```

## Performance: Responsive Images

### Serving Different Image Sizes
```tsx
import Image from 'next/image'

<Image
  src="/product.jpg"
  alt="Product"
  width={1200}
  height={800}
  sizes="
    (max-width: 640px) 100vw,      /* Mobile: full width */
    (max-width: 1024px) 50vw,      /* Tablet: half width */
    33vw                            /* Desktop: 1/3 width */
  "
  // Automatically generates:
  // - Mobile: 480px version
  // - Tablet: 1024px version
  // - Desktop: 1200px version
/>
```

## Mobile Navigation Pattern (Common)

```tsx
// Use BottomNavigationBar on mobile (already in your project!)
// Use TopNavbar + drawer on tablet/desktop

'use client'
import { useState } from 'react'
import TopNavbar from '@/components/layout/TopNavbar'
import BottomNavigationBar from '@/components/layout/BottomNavigationBar'

export default function Layout() {
  return (
    <div className="flex flex-col h-screen">
      {/* Top nav - visible on desktop */}
      <div className="hidden lg:block">
        <TopNavbar />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        {/* Page content */}
      </main>

      {/* Bottom nav - mobile only */}
      <div className="fixed bottom-0 w-full lg:hidden">
        <BottomNavigationBar />
      </div>
    </div>
  )
}
```

## Responsive Design Checklist

```
LAYOUT
□ Mobile-first classes written first
□ Breakpoint cascade (sm:, md:, lg:)
□ No horizontal scroll on any viewport
□ Proper grid/flex behavior per size
□ Sidebar/drawer patterns working

IMAGES
□ Images responsive (width: 100%)
□ Using next/image with sizes
□ Different crops/art direction if needed
□ No stretched/squished images

TYPOGRAPHY
□ Text scales with breakpoints
□ Reading line length 50-75 chars
□ Touch-friendly line height (1.5+)
□ No text truncation issues

COMPONENTS
□ Buttons ≥ 48px touch target (mobile)
□ Forms adapt to screen width
□ Modals/dialogs full-width on mobile
□ Drawers instead of sidebars on mobile

NAVIGATION
□ Mobile: hamburger/bottom nav
□ Tablet: drawer or top nav
□ Desktop: full navigation bar
□ All nav accessible on all sizes

TESTING
□ Tested at 340px, 768px, 1024px, 1920px
□ Landscape orientation works
□ No layout breaks
□ Keyboard navigation works on all sizes
□ DevTools responsive mode tested
□ Actual device testing (if possible)
```

## Resources

- **Tailwind Responsive Design**: https://tailwindcss.com/docs/responsive-design
- **MDN Web Responsive**: https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design
- **Mobile-First CSS**: https://www.mobileapproaches.com/
- **Container Queries**: https://developer.mozilla.org/en-US/docs/Web/CSS/Container_queries

---

**Always start mobile, then enhance for larger screens.** This mindset ensures better performance and user experience everywhere.
