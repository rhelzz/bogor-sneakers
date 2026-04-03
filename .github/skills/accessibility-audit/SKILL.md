---
name: accessibility-audit
description: "WCAG 2.1 AA accessibility compliance, keyboard navigation, screen reader testing, and a11y best practices. Use when: auditing components for accessibility, fixing contrast issues, implementing ARIA labels, or testing keyboard navigation. Ensures inclusive design for all users."
---

# Accessibility (a11y) Audit & Compliance

## WCAG 2.1 Level AA Standards

Your responsibility: **Ensure everyone can use your app** - disabled users, seniors, people with poor eyesight, limited mobility, cognitive disabilities, etc.

### Three Principles
```
1. PERCEIVABLE: Content must be visible/audible to users
   - Contrast ratios, alt text, captions

2. OPERABLE: Navigation must work without mouse
   - Keyboard navigation, focus indicators

3. UNDERSTANDABLE: Content must be clear and predictable
   - Clear language, consistent navigation, error messages

4. ROBUST: Code must be compatible with assistive technology
   - Semantic HTML, ARIA labels, proper structure
```

## Quick Accessibility Checklist

```
□ CONTRAST: Text ≥ 4.5:1 (AA standard)
□ ALT TEXT: Every image has descriptive alt text
□ KEYBOARD: Tab through entire page, no keyboard traps
□ FOCUS: Visual focus indicator always visible (ring-2)
□ LABELS: Form fields have associated labels
□ ARIA: Complex widgets have aria-* attributes
□ SEMANTIC HTML: Use <button>, <input>, <label> not <div>
□ HEADINGS: Proper hierarchy h1 > h2 > h3
□ COLOR: Don't rely on color alone (use icons, text)
□ MOTION: Respect prefers-reduced-motion
```

## Contrast Ratio Testing

### Minimum Requirements (WCAG AA)
```
Large text (18pt+): 3:1
Normal text: 4.5:1
UI components & icons: 3:1
```

### Test with Browser Tools
```bash
# Chrome DevTools
1. Right-click element
2. Select "Inspect"
3. Go to "Elements" → "Accessibility" tab
4. View contrast ratio

# Or use WebAIM Contrast Checker
# https://webaim.org/resources/contrastchecker/
```

### Bogor Sneakers Color Palette (Accessible)
```tsx
// ✓ ACCESSIBLE combinations (tested)
const colorCombinations = {
  // Text on background
  'primary-600 on white': '5.2:1',      // ✓ AA
  'gray-700 on white': '7.8:1',         // ✓ AAA
  'white on neutral-900': '17:1',       // ✓ AAA
  'accent-600 on white': '3.8:1',       // ✓ AA
  
  // ❌ NOT accessible (avoid)
  'primary-300 on white': '2.8:1',      // ✗ Fails AA
  'gray-300 on white': '1.1:1',         // ✗ Fails AA
}

// Implementation
<button className="bg-primary-600 text-white">
  {/* 5.2:1 contrast ✓ */}
</button>
```

## Semantic HTML (Foundation of Accessibility)

### Use Semantic Elements
```tsx
// ❌ NON-SEMANTIC
<div onClick={handleNavigate} className="cursor-pointer">
  Shop Now
</div>

// ✓ SEMANTIC
<button onClick={handleNavigate}>
  Shop Now
</button>

// ✓ For navigation
<nav>
  <a href="/catalog">Catalog</a>
</nav>

// ✓ For main content
<main>
  <section>
    <h1>Product Details</h1>
    <article>{/* product content */}</article>
  </section>
</main>

// ✓ Form structure
<label htmlFor="email">Email Address</label>
<input id="email" type="email" />
```

### Heading Hierarchy
```tsx
// ✓ CORRECT - h1 > h2 > h3
<h1>Bogor Sneakers Shop</h1>
<h2>Featured Collections</h2>
<h3>Premium Edition</h3>

// ❌ INCORRECT - Skipping levels
<h1>Bogor Sneakers Shop</h1>
<h3>Featured Collections</h3>  {/* h2 missing */}
```

## Keyboard Navigation

### Tab Order & Focus Management
```tsx
// ✓ Natural tab order (follows DOM order)
<button>First</button>
<button>Second</button>
<button>Third</button>

// ✓ Explicit tabIndex for custom order (use sparingly)
<button tabIndex={2}>Third</button>
<button tabIndex={1}>Second</button>
<button tabIndex={0}>First</button>

// ✓ Prevent keyboard trap (always allow Escape to exit)
<Dialog onEscapeKeyDown={handleClose}>
  <button onClick={handleClose}>Close</button>
</Dialog>

// Focus visible - highlight when using keyboard
<button className="focus:ring-2 focus:ring-primary-500 focus-visible:outline-none">
  Click me
</button>
```

### Common Keyboard Patterns

| Element | Keyboard Behavior |
|---------|-------------------|
| `<button>` | Space / Enter activates |
| `<a>` | Enter navigates |
| `<input>` | Type to input |
| `<select>` | Arrow keys change option |
| Dialog/Modal | Escape closes, Tab cycles focus |
| Menu | Arrow keys navigate, Escape closes |

### Test Keyboard Navigation
```bash
# Manual testing
1. Reload page
2. Press Tab repeatedly - cycle through all interactive elements
3. Press Shift+Tab - go backwards
4. Press Enter/Space on buttons
5. Press Escape on modals
6. Ensure no "keyboard traps" (can't Tab away)
```

## Focus Indicators (Visual Feedback)

### Always Show Focus for Keyboard Users
```tsx
// ✓ CORRECT - Always visible focus indicator
<button className="
  px-4 py-2 rounded-lg
  bg-primary-600 text-white
  focus:ring-2 focus:ring-primary-300 focus:ring-offset-2
  focus-visible:outline-none
  transition-all
">
  Click me
</button>

// ❌ WRONG - Removes visible focus
<button style={{ outline: 'none' }}>
  Click me
</button>

// ✓ Focus visible (shows only on keyboard, not mouse)
<button className="focus-visible:ring-2">
  Click me
</button>
```

### Dark Mode Focus Indicators
```tsx
<button className="
  focus:ring-2
  focus:ring-primary-500
  dark:focus:ring-primary-400
  focus:ring-offset-2
  dark:focus:ring-offset-neutral-900
">
  Click me
</button>
```

## Alt Text for Images

### Write Descriptive Alt Text
```tsx
// ✓ GOOD - Describes content and purpose
<Image
  src="/custom-red-sneaker.jpg"
  alt="Red high-top custom sneaker with white laces, personalized insole design"
/>

// ❌ BAD - Too vague
<Image src="/shoe.jpg" alt="shoe" />

// ❌ BAD - Redundant
<Image src="/product.jpg" alt="Image of product" />

// ✓ DECORATIVE - Empty alt
<Image src="/divider.png" alt="" role="presentation" />

// ✓ ICON - Describe purpose
<button aria-label="Open shopping cart">
  <ShoppingCart size={24} />
</button>
```

### Guidelines
```
✓ Context matters: "Red custom sneaker" not just "Shoe"
✓ Be descriptive but concise (under 150 characters)
✓ Don't say "Image of..." or "Logo of..."
✓ For images with text, include text in alt
✓ For decorative images, use alt=""
```

## ARIA (Accessible Rich Internet Applications)

### Common ARIA Attributes

```tsx
// aria-label - Name for elements without visible label
<button aria-label="Close dialog">×</button>

// aria-labelledby - Link to element that labels this
<h2 id="dialog-title">Confirm Order</h2>
<div role="dialog" aria-labelledby="dialog-title">
  {/* Content */}
</div>

// aria-describedby - Additional description
<input aria-describedby="pwd-hint" type="password" />
<span id="pwd-hint">At least 8 characters with numbers</span>

// aria-hidden - Hide from screen readers (visible but not announced)
<span aria-hidden="true">→</span>

// aria-expanded - Toggle button state
<button aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)}>
  Show menu
</button>

// aria-current - Mark current page in navigation
<nav>
  <a href="/catalog" aria-current="page">Catalog</a>
  <a href="/checkout">Checkout</a>
</nav>

// aria-live - Announce dynamic content changes
<div aria-live="polite" aria-atomic="true">
  {itemsAdded} items added to cart
</div>
```

### Bogor Sneakers Example: Accessible Product Card

```tsx
'use client'

interface ProductCardProps {
  product: Product
  onSelect: (id: string) => void
  isSelected: boolean
}

export default function ProductCard({
  product,
  onSelect,
  isSelected,
}: ProductCardProps) {
  return (
    <article
      className={`
        rounded-lg overflow-hidden shadow-md
        border-2 transition-all
        ${isSelected ? 'border-primary-600 ring-2 ring-primary-300' : 'border-gray-200'}
      `}
      aria-selected={isSelected}
      tabIndex={0}
      onClick={() => onSelect(product.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(product.id)
        }
      }}
      role="option"
      aria-label={`${product.name}, $${product.price}`}
    >
      {/* Image */}
      <img
        src={product.image}
        alt={`${product.name} - Size ${product.size} - ${product.color}`}
        className="w-full h-64 object-cover"
      />

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
          {product.name}
        </h3>
        <p className="text-primary-600 dark:text-primary-400 font-bold">
          ${product.price.toFixed(2)}
        </p>

        {/* Rating with ARIA */}
        <div
          className="flex items-center mt-2"
          aria-label={`Rating: ${product.rating} out of 5 stars`}
        >
          <span className="text-yellow-500">★</span>
          <span className="ml-1 text-gray-700 dark:text-gray-300">
            {product.rating}/5
          </span>
        </div>

        {/* Button states */}
        <button
          className={`
            mt-4 w-full py-2 rounded-lg font-medium
            transition-colors focus:ring-2 focus:ring-offset-2
            ${isSelected
              ? 'bg-gray-400 text-white cursor-default'
              : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
            }
          `}
          disabled={isSelected}
          onClick={() => onSelect(product.id)}
          aria-pressed={isSelected}
        >
          {isSelected ? 'Selected' : 'Select'}
        </button>
      </div>
    </article>
  )
}
```

## Form Accessibility

### Properly Linked Labels
```tsx
// ✓ CORRECT - label explicitly linked to input
<label htmlFor="email">Email Address</label>
<input id="email" type="email" />

// ✓ IMPLICIT - label wraps input
<label>
  Email Address
  <input type="email" />
</label>

// ❌ WRONG - No label association
<label>Email Address</label>
<input type="email" />
```

### Error Messages & Validation
```tsx
'use client'
import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) {
      setError('Invalid email format')
      return
    }
    setError('')
    // Submit
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email *</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-describedby={error ? 'email-error' : undefined}
        aria-required="true"
        className={error ? 'border-red-500' : 'border-gray-300'}
      />
      
      {error && (
        <span id="email-error" className="text-error" role="alert">
          {error}
        </span>
      )}
    </form>
  )
}
```

## Motion & Animation Accessibility

### Respect prefers-reduced-motion

```tsx
// Disable animations for users with motion sensitivity
<div className="
  transition-all duration-300
  motion-reduce:transition-none
  motion-reduce:animate-none
">
  animated content
</div>

// Check preference in JavaScript
const prefersReducedMotion = window.matchMedia('(prefers-color-scheme: dark)').matches
```

### Framer Motion with Accessibility
```tsx
import { motion } from 'framer-motion'

export default function AnimatedCard() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
    >
      Content
    </motion.div>
  )
}
```

## Testing & Auditing Tools

### Browser Extensions
- **axe DevTools** (Chrome/Firefox)
  - Scans page for a11y violations
  - Real-time error detection
  
- **WAVE** (WebAIM)
  - Color contrast checker
  - ARIA validation

- **Lighthouse** (Chrome)
  - Built into DevTools
  - Audit accessibility score

### Manual Testing Workflows
```bash
# 1. Keyboard-only navigation
Disable mouse, use Tab/Shift+Tab only
Ensure all functions accessible via keyboard

# 2. Screen reader testing
Use built-in OS screen reader:
  Windows: Narrator (Win + S)
  Mac: VoiceOver (Cmd + F5)
  Browser: NVDA (Windows) or JAWS

# 3. Color contrast
Check all text meets 4.5:1 for normal text

# 4. Zoom test
Zoom to 200% - layout should not break

# 5. Motion test
Enable prefers-reduced-motion:
  Chrome DevTools → Rendering → Emulate CSS media
```

## Accessibility Audit Checklist (Template)

Use this checklist for PRs and feature launches:

```
PERCEPTION
□ All non-decorative images have alt text
□ Text contrast ≥ 4.5:1 on backgrounds
□ Color not only way to convey information
□ Captions for videos/audio

OPERATION
□ All functionality operable via keyboard
□ No keyboard traps
□ Focus indicators always visible
□ Proper focus order (Tab key)

UNDERSTANDING
□ Page has proper heading hierarchy (h1, h2, h3...)
□ Form labels properly associated with inputs
□ Error messages clear and linked to fields
□ Navigation consistent across pages

ROBUSTNESS
□ Semantic HTML used (button, input, nav, main)
□ ARIA labels on icon-only buttons
□ No ARIA misuse
□ Valid HTML/CSS (W3C Validator)

TESTING
□ Tested with keyboard only
□ Tested with screen reader (NVDA, JAWS, Safari)
□ axe DevTools scan passed
□ Manual contrast check completed
```

## Resources

- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **WebAIM Blog**: https://webaim.org/blog/
- **MDN Accessibility**: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- **A11y Project**: https://www.a11yproject.com/

---

**Remember:** Accessibility is not an afterthought—build it in from the start!
