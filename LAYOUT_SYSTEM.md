# Form Layout System Documentation

## Overview

The Form Layout System provides flexible, responsive layout strategies for form rendering with intelligent field sizing and multiple layout approaches. It supports both top-level form layouts and nested object layouts.

## Layout Strategies

### 1. Vertical Layout (`vertical`)
- **Description**: One field per row, stacked vertically
- **Use Case**: Mobile devices, simple forms, accessibility-focused layouts
- **Behavior**: Each field takes full width and stacks vertically

### 2. Intelligent Flow Layout (`intelligent-flow`)
- **Description**: Smart wrapping based on field content and screen size
- **Use Case**: Mixed field types with varying content lengths
- **Behavior**: 
  - Groups related short fields horizontally
  - Keeps complex fields (textareas, arrays) vertical
  - Automatically wraps when space runs out
  - Content-aware field sizing

### 3. 12-Column Grid Layout (`grid-12`)
- **Description**: CSS Grid with 12-column system and intelligent field sizing
- **Use Case**: Desktop forms, precise layout control
- **Behavior**:
  - Uses CSS Grid with 12 equal columns
  - Automatic field width calculation based on field type
  - Responsive column spanning
  - Predictable, framework-like behavior

### 4. Responsive Adaptive Layout (`responsive-adaptive`)
- **Description**: Automatically adapts strategy based on screen size
- **Use Case**: Universal forms that work across all devices
- **Default Behavior**:
  - **Mobile (≤768px)**: Vertical layout
  - **Tablet (769-1024px)**: Intelligent flow
  - **Desktop (≥1025px)**: 12-column grid

## Field Width Intelligence

### Default Field Widths (12-column grid)

```typescript
const DEFAULT_FIELD_WIDTHS = {
  // Narrow fields (3 columns = 25%)
  boolean: 3,
  
  // Medium fields (4 columns = 33%)
  number: 4,
  integer: 4,
  
  // Wide fields (6 columns = 50%)
  string: 6,
  email: 6,
  url: 6,
  password: 6,
  
  // Full width fields (12 columns = 100%)
  textarea: 12,
  array: 12,
  object: 12,
  
  // Variable width
  enum: 4, // Adjusts based on option count
};
```

### Content-Aware Adjustments

The system automatically adjusts field widths based on:

1. **String Length Constraints**:
   - `maxLength ≤ 10`: 3 columns
   - `maxLength ≤ 30`: 4 columns
   - `maxLength ≤ 50`: 6 columns
   - `maxLength > 100`: 12 columns

2. **Enum Options**:
   - ≤ 2 options: 3 columns
   - ≤ 4 options: 4 columns
   - > 4 options: 6 columns

3. **Label Length**:
   - Long labels (> 20 chars): Minimum 6 columns

4. **Validation Errors**:
   - Fields with errors: Minimum 6 columns (for error message space)

5. **Description Length**:
   - Long descriptions (> 50 chars): Minimum 8 columns

## Schema Configuration

### Form-Level Layout

```json
{
  "type": "object",
  "x-layout": {
    "strategy": "grid-12",
    "gap": "md",
    "breakpoints": {
      "mobile": "vertical",
      "tablet": "intelligent-flow",
      "desktop": "grid-12"
    }
  },
  "properties": { ... }
}
```

### Field-Level Layout

```json
{
  "type": "string",
  "title": "Custom Field",
  "x-layout": {
    "columns": 8,
    "minColumns": 4,
    "maxColumns": 12,
    "span": "full",
    "order": 1,
    "breakBefore": true,
    "breakAfter": false
  }
}
```

### Responsive Field Configuration

```json
{
  "type": "boolean",
  "title": "Subscribe",
  "x-layout": {
    "columns": {
      "mobile": 12,
      "tablet": 6,
      "desktop": 3
    }
  }
}
```

### Object-Level Layout

```json
{
  "type": "object",
  "title": "Address",
  "x-layout": {
    "strategy": "grid-12",
    "gap": "sm"
  },
  "properties": {
    "street": {
      "type": "string",
      "x-layout": { "columns": 8 }
    },
    "city": {
      "type": "string", 
      "x-layout": { "columns": 6 }
    },
    "state": {
      "type": "string",
      "x-layout": { "columns": 3 }
    },
    "zip": {
      "type": "string",
      "x-layout": { "columns": 3 }
    }
  }
}
```

## Implementation Architecture

### Core Components

1. **LayoutContainer**: Main layout orchestrator
2. **useLayout**: Hook for responsive layout management
3. **layoutUtils**: Utility functions for field sizing and grouping
4. **Layout Types**: TypeScript definitions for layout configuration

### Key Files

```
src/
├── types/layout.ts                 # Layout type definitions
├── hooks/useLayout.ts             # Layout management hooks
├── utils/layout/layoutUtils.ts    # Layout calculation utilities
├── components/layout/
│   ├── LayoutContainer.tsx        # Main layout component
│   └── index.ts                   # Layout exports
├── components/FormRenderer.tsx    # Updated to use LayoutContainer
├── components/fields/ObjectField/ # Updated for nested layouts
└── index.css                     # Layout CSS classes
```

### CSS Classes

The system generates CSS classes for responsive behavior:

```css
/* Grid column spans */
.field-col-1 { grid-column: span 1; }
.field-col-2 { grid-column: span 2; }
/* ... up to .field-col-12 */

/* Layout containers */
.layout-vertical { display: flex; flex-direction: column; }
.layout-flow { display: flex; flex-direction: column; }
.layout-grid-12 { display: grid; grid-template-columns: repeat(12, 1fr); }

/* Responsive breakpoints */
@media (max-width: 768px) {
  .layout-grid-12 { grid-template-columns: 1fr; }
  .field-col-* { grid-column: span 1; }
}
```

## Usage Examples

### Basic Usage

```tsx
import FormRenderer from './components/FormRenderer';
import type { LayoutConfig } from './types/layout';

const layoutConfig: LayoutConfig = {
  strategy: 'grid-12',
  gap: 'md'
};

<FormRenderer
  formModel={formModel}
  layoutConfig={layoutConfig}
  onSubmit={handleSubmit}
/>
```

### Responsive Layout

```tsx
const responsiveLayout: LayoutConfig = {
  strategy: 'responsive-adaptive',
  gap: 'md',
  breakpoints: {
    mobile: 'vertical',
    tablet: 'intelligent-flow', 
    desktop: 'grid-12'
  }
};
```

### Custom Field Grouping

```tsx
const customLayout: LayoutConfig = {
  strategy: 'grid-12',
  fieldGroups: [
    {
      fields: ['firstName', 'lastName'],
      columns: [6, 6],
      groupSpan: 12
    },
    {
      fields: ['city', 'state', 'zip'],
      columns: [6, 3, 3],
      groupSpan: 12
    }
  ]
};
```

## Benefits

### 1. **Developer Experience**
- Schema-driven configuration
- Intelligent defaults
- TypeScript support
- Predictable behavior

### 2. **User Experience**
- Responsive design
- Optimal field sizing
- Consistent spacing
- Accessibility support

### 3. **Performance**
- CSS Grid and Flexbox
- Minimal re-renders
- Efficient responsive behavior
- Modern browser optimization

### 4. **Flexibility**
- Multiple layout strategies
- Per-field customization
- Nested object layouts
- Custom breakpoints

## Browser Support

- **Modern Browsers**: Full support (Chrome 57+, Firefox 52+, Safari 10.1+)
- **CSS Grid**: Required for grid layouts
- **Flexbox**: Required for flow layouts
- **CSS Custom Properties**: Used for dynamic spacing

## Migration Guide

### From Simple Vertical Layout

**Before:**
```tsx
<FormRenderer formModel={formModel} />
```

**After:**
```tsx
<FormRenderer 
  formModel={formModel}
  layoutConfig={{ strategy: 'vertical' }}
/>
```

### Adding Grid Layout

**Schema Update:**
```json
{
  "type": "object",
  "x-layout": { "strategy": "grid-12" },
  "properties": {
    "name": {
      "type": "string",
      "x-layout": { "columns": 6 }
    }
  }
}
```

### Responsive Enhancement

```json
{
  "x-layout": {
    "strategy": "responsive-adaptive",
    "breakpoints": {
      "mobile": "vertical",
      "desktop": "grid-12"
    }
  }
}
```

## Best Practices

### 1. **Choose the Right Strategy**
- **Vertical**: Simple forms, mobile-first
- **Intelligent Flow**: Mixed content types
- **Grid-12**: Complex forms, desktop-focused
- **Responsive Adaptive**: Universal forms

### 2. **Field Sizing Guidelines**
- Let intelligent sizing handle most cases
- Override only when necessary
- Consider content length and validation messages
- Test across different screen sizes

### 3. **Responsive Design**
- Always test on mobile devices
- Use responsive-adaptive for universal forms
- Consider touch targets on mobile
- Ensure adequate spacing

### 4. **Performance Optimization**
- Use CSS Grid for complex layouts
- Minimize layout recalculations
- Leverage browser caching for CSS
- Test with large forms

## Troubleshooting

### Common Issues

1. **Fields Not Sizing Correctly**
   - Check `x-layout` configuration
   - Verify field type mapping
   - Test content-aware adjustments

2. **Responsive Behavior Not Working**
   - Verify breakpoint configuration
   - Check CSS media queries
   - Test window resize events

3. **Layout Overflow**
   - Check total column spans (should ≤ 12)
   - Verify `minWidth: 0` on containers
   - Test with long content

4. **Performance Issues**
   - Minimize layout recalculations
   - Use `useCallback` for event handlers
   - Check for unnecessary re-renders

### Debug Tools

```tsx
// Enable layout debugging
const layoutConfig = {
  strategy: 'grid-12',
  debug: true // Shows grid lines and field boundaries
};
```

## Future Enhancements

### Planned Features

1. **Custom Grid Systems**: Support for non-12-column grids
2. **Advanced Field Grouping**: Visual grouping with borders/backgrounds
3. **Layout Templates**: Pre-built layout configurations
4. **Animation Support**: Smooth transitions between layouts
5. **Accessibility Enhancements**: Better screen reader support
6. **Performance Monitoring**: Layout performance metrics

### Experimental Features

1. **CSS Subgrid**: When browser support improves
2. **Container Queries**: For component-level responsiveness
3. **Layout Algorithms**: AI-powered optimal layouts
4. **Visual Layout Editor**: Drag-and-drop layout configuration
