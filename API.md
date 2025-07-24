# Schema Form Library API Documentation

## FormModel

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
```

## ThemeProvider

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
   * Children components
   */
  children: ReactNode
}
