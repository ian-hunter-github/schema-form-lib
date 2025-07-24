# Schema Form Library

A powerful React form library that generates forms from JSON schemas with extensive customization options.

## Features

- Dynamic form generation from JSON schemas
- Comprehensive field types and validation
- Theme customization
- Flexible layout system
- Array and nested object support
- TypeScript support

## Installation

```bash
npm install schema-form-lib
```

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/schema-form-lib.git
cd schema-form-lib
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

## Git Workflow

### Branching Strategy
- `main`: Stable production branch
- `feature/*`: Feature development branches
- `bugfix/*`: Bug fix branches

### Creating a Release
```bash
git tag -a v0.1.0 -m "Release 0.1.0"
git push origin v0.1.0
```

## Building & Publishing

1. Build the package:
```bash
npm run build
```

2. Publish to npm:
```bash
npm login
npm publish --access public
```

3. Version management:
```bash
npm version patch|minor|major
```

## Basic Usage

```jsx
import { FormContainer } from 'schema-form-lib';
import { useFormModel } from 'schema-form-lib/hooks';

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Full Name' },
    age: { type: 'number', minimum: 18 }
  }
};

function App() {
  const { formModel } = useFormModel({ schema });
  return <FormContainer formModel={formModel} nestingDepth={0} />;
}
```

## User Guide

### Core Components

#### FormContainer
Main form wrapper component with props:
- `formModel`: FormModel instance
- `nestingDepth`: Current nesting level (0 for root)
- `layoutConfig`: Optional layout configuration
- `showDescriptions`: Show/hide field descriptions

#### Field Update Handling
The library manages field updates through:

1. **Validation Flow**:
   - OnChange: Basic type validation
   - OnBlur: Full validation (configurable)
   - OnSubmit: Comprehensive validation

2. **Change Tracking**:
   - Tracks dirty/pristine state per field
   - Maintains original vs current values
   - Supports reverting changes

3. **Error Propagation**:
   - Immediate visual feedback
   - Error messages from schema
   - Custom validation support

4. **Performance**:
   - Batched updates for arrays
   - Optimized re-renders
   - Selective validation for nested fields

## Developer Guide

### Field Update Implementation

#### Validation Process
1. Field changes trigger `setValue()` in FormModel
2. Value updates propagate through FieldUpdater
3. Validation occurs via FormValidator
4. Errors are applied to field state

#### Change Tracking
- Dirty state managed via BufferingManager
- Original values stored in FormField instances
- Change detection uses deep equality checks

#### Performance Optimizations
- Debounced validation for rapid input
- Memoized field components
- Batched state updates

### Adding JSDoc Documentation
All core classes now include JSDoc comments:
```typescript
/**
 * Manages form state and validation
 * @class FormModel
 * @param {JSONSchema} schema - Form schema definition
 * @param {Object} [options] - Configuration options
 * @param {boolean} [options.hybridMode] - Enable hybrid change tracking
 */
class FormModel {
  /**
   * Sets a field's value
   * @param {string} path - Field path (e.g. 'user.name')
   * @param {JSONValue} value - New field value
   * @throws {FormModelError} If field not found or invalid value
   */
  setValue(path: string, value: JSONValue): void
}
```

### FieldRenderers
Specialized components for each field type:
- StringField
- NumberField
- BooleanField
- ArrayField
- ObjectField

## Advanced Features

### Array Operations
```jsx
// Adding array items
formModel.addValue('arrayPath', defaultValue);

// Removing items
formModel.deleteValue('arrayPath.0');
```

### Theme Customization

The library provides comprehensive theming support through the `ThemeProvider` component.

#### Basic Usage
```jsx
import { ThemeProvider } from 'schema-form-lib';

<ThemeProvider>
  <FormContainer formModel={formModel} />
</ThemeProvider>
```

#### Default Theme Structure
The default theme includes:
```json
{
  "colors": {
    "primary": { "500": "#3b82f6" },
    "secondary": { "500": "#6b7280" }
  },
  "spacing": {
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem"
  },
  "typography": {
    "fontFamily": "system-ui, sans-serif"
  }
}
```

#### Overriding Theme Values
```jsx
const customTheme = {
  colors: {
    primary: { 500: '#10b981' } // Override primary color
  }
};

<ThemeProvider initialTheme={customTheme}>
  <FormContainer formModel={formModel} />
</ThemeProvider>
```

#### Creating Custom Themes
1. Extend the default theme:
```jsx
import { defaultTheme } from 'schema-form-lib/theme';

const customTheme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: { 500: '#ef4444' }
  }
};
```

2. Create from scratch (must match theme schema):
```jsx
const customTheme = {
  colors: {
    primary: { 500: '#8b5cf6' },
    error: { 500: '#dc2626' }
  },
  spacing: {
    sm: '4px',
    md: '8px',
    lg: '16px'
  }
};
```

#### Theme Validation
Themes are validated against the theme schema:
- Invalid themes fall back to defaults
- Warnings are logged in development
- Use `theme.schema.json` for reference

#### Dynamic Theme Switching
```jsx
const [currentTheme, setTheme] = useState(defaultTheme);

<ThemeProvider initialTheme={currentTheme}>
  <FormContainer formModel={formModel} />
  <button onClick={() => setTheme(darkTheme)}>
    Switch to Dark Theme
  </button>
</ThemeProvider>
```

## Performance Considerations

### Unnecessary UI Form Refreshes
The API Demo exhibits form refreshes when fields are updated due to:

1. Complex nested schema structure triggering full validation
2. Deeply nested objects causing multiple state updates
3. No current optimization for partial validation

**Workaround**: Use simpler schemas or break forms into smaller components.

**Future Improvements**:
- Partial validation for nested fields
- Optimized state updates
- Memoization of field components

## Outstanding Issues

- Complex schema performance (tracked in #123)
- Nested array validation edge cases
- Theme customization limitations

## Examples

See the demo implementations:
- `src/demo/FormContainerDemo.tsx`
- `src/demo/ApiConfigDemo.tsx`
- `src/demo/ThemeDemo.tsx`

## API Documentation

For complete API documentation including all classes, methods and types, see [API.md](API.md).

### Core API Reference

```typescript
/**
 * Core form state management class that handles:
 * - Field creation and validation
 * - Value updates and change tracking
 * - Array operations
 * - Form lifecycle events
 */
class FormModel {
  /**
   * @param schema - JSON schema definition
   * @param options - { hybridMode?: boolean }
   */
  constructor(schema: JSONSchema, options?: { hybridMode?: boolean })

  /**
   * Sets a field's value
   * @param path - Field path (e.g. 'user.name')
   * @param value - New field value
   * @throws {FormModelError} If invalid path or value
   */
  setValue(path: string, value: JSONValue): void

  /**
   * Validates all fields
   * @returns true if all fields are valid
   */
  validate(): boolean

  /**
   * Gets all form fields
   * @returns Map of path => FormField
   */
  getFields(): Map<string, FormField>
}

### ThemeProvider

```typescript
/**
 * Provides theme context to form components
 */
interface ThemeProviderProps {
  /**
   * Initial theme configuration
   * @default defaultTheme
   */
  initialTheme?: ThemeObject

  /**
   * URL to load theme JSON from
   */
  themeUrl?: string

  /**
   * Children components
   */
  children: ReactNode
}
```

## Code Documentation

The library uses comprehensive JSDoc comments throughout the codebase. Key aspects:

### Generating Documentation
```bash
npm run docs  # Generates HTML documentation
```

### JSDoc Standards
All public APIs include:
- `@class` descriptions for classes
- `@param` for method parameters  
- `@returns` for return values
- `@throws` for error conditions

Example from FormModel:
```typescript
/**
 * Core form state management class
 * @class FormModel
 * @param {JSONSchema} schema - Form schema definition
 * @param {Object} [options] - Configuration options
 */
class FormModel {
  /**
   * Sets a field's value
   * @param {string} path - Field path
   * @param {JSONValue} value - New value
   * @throws {FormModelError} If invalid path/value
   */
  setValue(path: string, value: JSONValue): void
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request
4. Include tests for new features

```bash
npm test  # Run tests
npm lint  # Check code style
