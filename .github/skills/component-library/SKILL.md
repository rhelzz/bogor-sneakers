---
name: component-library
description: "Component library setup, patterns, and best practices. Use when: creating reusable components, setting up Shadcn/UI, organizing component structure, or refactoring existing components for consistency. Provides templates and architectural guidance."
---

# Component Library Setup & Patterns

## Quick Reference

| Task | Use When |
|------|----------|
| **New component** | Building a reusable UI element (Button, Card, Form) |
| **Shadcn/UI** | Need a complex component (Dialog, Select, DatePicker) |
| **Component audit** | Refactor existing components for consistency |
| **Type safety** | Ensure props and exports are TypeScript-first |
| **Documentation** | Create usage examples and variant showcase |

## Bogor Sneakers: Component Folder Structure

```
src/components/
├── ui/                          # Shadcn/UI + base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   └── ...
├── layout/                      # App structure
│   ├── TopNavbar.tsx            # Existing ✓
│   ├── BottomNavigationBar.tsx  # Existing ✓
│   ├── SidebarNav.tsx
│   └── Footer.tsx
├── features/                    # Feature-specific
│   ├── catalog/
│   │   ├── ProductCard.tsx
│   │   ├── FilterBar.tsx
│   │   └── CatalogGrid.tsx
│   ├── checkout/
│   │   ├── CheckoutForm.tsx
│   │   ├── OrderSummary.tsx
│   │   └── PaymentStep.tsx
│   ├── customize/
│   │   ├── GymShoePreview.tsx   # Existing ✓
│   │   ├── ColorPicker.tsx
│   │   ├── SizeSelector.tsx
│   │   └── CustomizationPanel.tsx
│   └── custom-box/
│       ├── BoxBuilder.tsx
│       ├── PreviewBox.tsx
│       └── BoxOptions.tsx
└── shared/                      # Cross-feature utilities
    ├── Badge.tsx
    ├── ImageOptimized.tsx
    ├── LoadingSpinner.tsx
    └── EmptyState.tsx
```

## Component Template (Reusable Pattern)

```tsx
// components/ui/Badge.tsx
'use client'

import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
}

export default function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        // Base
        'inline-flex items-center rounded-full font-semibold',
        // Sizes
        size === 'sm' && 'px-2 py-1 text-xs',
        size === 'md' && 'px-3 py-1.5 text-sm',
        size === 'lg' && 'px-4 py-2 text-base',
        // Variants
        variant === 'default' && 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
        variant === 'secondary' && 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-200',
        variant === 'success' && 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-200',
        variant === 'warning' && 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-200',
        variant === 'error' && 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
```

## Shadcn/UI Installation Workflow

### Step 1: Find Component
```bash
npx shadcn-ui@latest add dialog
```

### Step 2: Usage Example
```tsx
// features/checkout/PaymentDialog.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function PaymentDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Complete Payment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment Information</DialogTitle>
        </DialogHeader>
        {/* Content */}
      </DialogContent>
    </Dialog>
  )
}
```

## Component Variant Documentation

Create a visual showcase for your components:

```tsx
// components/showcase.tsx
import Badge from './ui/Badge'

export function BadgeShowcase() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Variants</h3>
        <div className="space-x-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Sizes</h3>
        <div className="space-x-2">
          <Badge size="sm">Small</Badge>
          <Badge size="md">Medium</Badge>
          <Badge size="lg">Large</Badge>
        </div>
      </div>
    </div>
  )
}
```

## Accessibility Checklist for Components

```
□ Semantic HTML (<button>, <input>, <label>, etc.)
□ ARIA labels for icon-only buttons
□ Keyboard navigation (Tab, Enter, Space, Escape)
□ Focus indicators visible (focus:ring-2)
□ Color contrast ratio ≥ 4.5:1 (WCAG AA)
□ Reduced motion support (motion-reduce:)
□ Screen reader tested
□ Type-safe props (TypeScript)
```

## Type-Safe Props Pattern

```tsx
// components/features/catalog/ProductCard.tsx
'use client'

import { HTMLAttributes } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  price: number
  image: string
  rating: number
}

interface ProductCardProps extends HTMLAttributes<HTMLDivElement> {
  product: Product
  onSelect?: (id: string) => void
  isSelected?: boolean
}

export default function ProductCard({
  product,
  onSelect,
  isSelected = false,
  className,
  ...props
}: ProductCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden border hover:shadow-lg transition-shadow cursor-pointer',
        isSelected && 'ring-2 ring-blue-500',
        className
      )}
      onClick={() => onSelect?.(product.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect?.(product.id)
        }
      }}
      {...props}
    >
      <Image
        src={product.image}
        alt={product.name}
        width={300}
        height={300}
        className="w-full h-64 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-gray-600">${product.price.toFixed(2)}</p>
        <div className="flex items-center mt-2">
          <span className="text-yellow-500">★</span>
          <span className="ml-1">{product.rating}/5</span>
        </div>
      </div>
    </div>
  )
}
```

## Export Organization

```tsx
// components/index.ts - Barrel exports for cleaner imports
export { default as Button } from './ui/button'
export { default as Card } from './ui/card'
export { default as TopNavbar } from './layout/TopNavbar'
export { default as BottomNavigationBar } from './layout/BottomNavigationBar'
export { default as ProductCard } from './features/catalog/ProductCard'

// Usage in pages/
import { Button, Card, ProductCard } from '@/components'
```

## Component Testing Criteria

When creating components, test these states:

```
✓ Default render
✓ Disabled state
✓ Loading state (if async)
✓ Error state (if handling data)
✓ Empty state (if showing list)
✓ Hover/Focus states
✓ Mobile responsiveness
✓ Dark mode (if applicable)
✓ Keyboard navigation
✓ Screen reader (a11y)
```

---

**Next:** Check the Tailwind CSS Themes skill for styling consistency.
