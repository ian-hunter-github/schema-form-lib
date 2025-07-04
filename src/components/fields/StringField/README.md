# StringField Component

A React component for rendering string input fields that uses the FormField data structure as backing. This component provides comprehensive support for validation, dirty state tracking, error display, and various field configurations.

## Features

- **FormField Integration**: Uses FormField as the primary data structure
- **Validation Support**: Displays validation errors with visual indicators
- **Dirty State Tracking**: Shows when field has been modified
- **Required Field Indicators**: Visual indication for required fields
- **Read-only Support**: Disables input when field is read-only
- **Flexible Labeling**: Supports custom titles or auto-generates from field path
- **Description Support**: Optional field descriptions
- **DOM Context Support**: Configurable DOM IDs for testing and accessibility

## Usage

### Basic Usage

```tsx
import StringField from './components/fields/StringField';
import type { FormField } from './utils/form/types';

const field: FormField = {
  path: 'username',
  value: '',
  pristineValue: '',
  schema: {
    type: 'string',
    title: 'Username',
    description: 'Enter your username'
  },
  errors: [],
  errorCount: 0,
  required: true,
  dirty: false,
  dirtyCount: 0,
  hasChanges: false,
  lastModified: new Date()
};

const handleChange = (value: string, triggerValidation?: boolean) => {
  // Handle field value changes
  console.log('Field changed:', { value, triggerValidation });
};

<StringField 
  field={field} 
  onChange={handleChange} 
/>
```

### With DOM Context

```tsx
<StringField 
  field={field} 
  onChange={handleChange}
  domContextId="userForm"
/>
```

## Props

### StringFieldProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `field` | `FormField` | Yes | The FormField object containing field data and metadata |
| `onChange` | `(value: string, triggerValidation?: boolean) => void` | Yes | Callback function called when field value changes |
| `domContextId` | `string` | No | Optional DOM context ID for field identification |

### FormField Structure

The `field` prop expects a FormField object with the following structure:

```typescript
interface FormField {
  path: string;              // Field path (e.g., 'user.email')
  value: JSONValue;          // Current field value
  pristineValue: JSONValue;  // Original value for revert operations
  schema: JSONSchema;        // JSON Schema definition
  errors: string[];          // Array of validation error messages
  errorCount: number;        // Number of validation errors
  required: boolean;         // Whether field is required
  dirty: boolean;           // Whether field has been modified
  dirtyCount: number;       // Number of modifications
  hasChanges: boolean;      // True if value !== pristineValue
  lastModified: Date;       // Timestamp of last modification
}
```

## Field States

### Clean State
- Field displays with default styling
- No error messages shown
- No dirty indicator

### Dirty State
- Shows "Modified" indicator when `field.dirty` is true
- Indicates the field has been changed from its original value

### Error State
- Displays validation errors in red text
- Shows the first error message from `field.errors` array
- Error styling applied to indicate validation failure

### Required State
- Label shows required indicator when `field.required` is true
- Adds "required" class to label for styling

### Read-only State
- Input is disabled when `field.schema.readOnly` is true
- User cannot modify the field value

## Styling

The component uses CSS classes for styling:

- `.field-container` - Container for the entire field
- `.label` - Base label styling
- `.label.required` - Required field label styling

## Testing

The component includes comprehensive tests covering:

- Basic rendering and props
- Value display and changes
- Error state handling
- Dirty state tracking
- Required field indicators
- Read-only functionality
- DOM context ID usage
- Nested field paths
- Complex scenarios with multiple features

Run tests with:
```bash
npm test -- src/components/fields/StringField/__tests__/StringField.test.tsx
```

## Demo

A demo component is available at `StringFieldDemo.tsx` that showcases various field configurations and states. This can be used for development and testing purposes.

## Storybook

Storybook stories are available in the `stories/` directory, providing interactive examples of different field configurations. Note: Storybook requires Node.js 20+ to run.

## File Structure

```
StringField/
├── StringField.tsx          # Main component
├── index.ts                 # Export file
├── README.md               # This documentation
├── StringFieldDemo.tsx     # Demo component
├── __tests__/
│   └── StringField.test.tsx # Test suite
└── stories/
    └── StringField.stories.tsx # Storybook stories
```

## Migration from Legacy StringField

The new StringField component uses FormField instead of the legacy FieldProps interface:

### Before (Legacy)
```tsx
<StringField 
  name="username"
  value="john_doe"
  schema={{ type: 'string', title: 'Username' }}
  onChange={(value) => {}}
  error="Username is required"
  domContextId="form"
/>
```

### After (New)
```tsx
const field: FormField = {
  path: 'username',
  value: 'john_doe',
  schema: { type: 'string', title: 'Username' },
  errors: ['Username is required'],
  // ... other FormField properties
};

<StringField 
  field={field}
  onChange={(value, triggerValidation) => {}}
  domContextId="form"
/>
```

## Benefits of FormField Integration

1. **Centralized State**: All field metadata in one object
2. **Better Validation**: Built-in error tracking and counting
3. **Change Tracking**: Automatic dirty state and change detection
4. **Audit Trail**: Last modified timestamps
5. **Consistency**: Uniform interface across all field types
