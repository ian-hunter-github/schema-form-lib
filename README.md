# Schema Form Builder

A powerful React component library for generating forms from JSON schemas with extensive customization options.

## Installation

```bash
npm install schema-form-app@beta
# or
yarn add schema-form-app@beta
```

## Getting Started

### Basic Usage

```jsx
import { SchemaRenderer } from 'schema-form-app';

const schema = {
  type: 'object',
  properties: {
    name: { 
      type: 'string',
      title: 'Full Name',
      description: 'Enter your full name'
    },
    age: { 
      type: 'number',
      minimum: 18,
      maximum: 120 
    }
  },
  required: ['name']
};

function App() {
  return (
    <SchemaRenderer 
      schema={schema}
      onSubmit={(data) => console.log(data)}
    />
  );
}
```

### Loading Schema from File or URL

```jsx
import { SchemaRenderer } from 'schema-form-app';
import { useState, useEffect } from 'react';

async function loadSchemaFromFile() {
  const response = await fetch('/path/to/schema.json');
  return await response.json();
}

async function loadSchemaFromUrl(url) {
  const response = await fetch(url);
  return await response.json();
}

function App() {
  const [schema, setSchema] = useState(null);

  useEffect(() => {
    // Load from local file
    loadSchemaFromFile().then(setSchema);
    
    // OR load from URL
    // loadSchemaFromUrl('https://example.com/schemas/form.json').then(setSchema);
  }, []);

  if (!schema) return <div>Loading schema...</div>;

  return (
    <SchemaRenderer 
      schema={schema}
      onSubmit={(data) => console.log(data)}
    />
  );
}
```

## Advanced Features

### Theme Customization

The form appearance can be fully customized through themes. There are three ways to apply a theme:

#### 1. Using a Theme Object

```jsx
import { ThemeProvider } from 'schema-form-app';
import { SchemaRenderer } from 'schema-form-app';

const customTheme = {
  name: 'my-theme',
  colors: {
    primary: {
      500: '#3b82f6', // Blue-500
      600: '#2563eb'  // Blue-600
    },
    semantic: {
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    }
  },
  spacing: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem'
  }
};

function App() {
  return (
    <ThemeProvider initialTheme={customTheme}>
      <SchemaRenderer schema={schema} />
    </ThemeProvider>
  );
}
```

#### 2. Using a JSON File

```jsx
import theme from './custom-theme.json';

function App() {
  return (
    <ThemeProvider initialTheme={theme}>
      <SchemaRenderer schema={schema} />
    </ThemeProvider>
  );
}
```

#### 3. Loading from URL

```jsx
function App() {
  return (
    <ThemeProvider themeUrl="/themes/custom.json">
      <SchemaRenderer schema={schema} />
    </ThemeProvider>
  );
}
```

#### Default Theme

The package includes a built-in default theme that's automatically applied when no custom theme is specified. You can find the default theme configuration at:

```json
// src/theme/themes/default.json
{
  "name": "default",
  "colors": {
    "primary": {
      "500": "#3b82f6",
      "600": "#2563eb"
    },
    "semantic": {
      "error": "#ef4444",
      "warning": "#f59e0b",
      "success": "#10b981"
    }
  },
  "spacing": {
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem"
  }
}
```

To extend the default theme while keeping its core styles, you can merge it with your customizations:

```jsx
import defaultTheme from 'schema-form-app/themes/default';

const customTheme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: {
      500: '#8b5cf6', // Purple-500
      600: '#7c3aed'  // Purple-600
    }
  }
};

function App() {
  return (
    <ThemeProvider initialTheme={customTheme}>
      <SchemaRenderer schema={schema} />
    </ThemeProvider>
  );
}
```

### Layout Customization

Control form layout using the `layout` prop:

```jsx
<SchemaRenderer
  schema={schema}
  layout={{
    type: 'grid',
    columns: 2,
    gap: '1rem',
    responsive: {
      sm: { columns: 1 },
      md: { columns: 2 }
    }
  }}
/>
```

Available layout options:
- `grid`: Multi-column grid layout with configurable columns and gaps
- `stack`: Vertical stack of fields with consistent spacing
- `tabs`: Tabbed interface for complex forms (supports nested layouts)
- `accordion`: Collapsible sections with expand/collapse controls
- `horizontal`: Fields arranged in a horizontal row
- `custom`: Allows defining custom layout components

Layout properties:
- `type`: One of the above layout types (required)
- `columns`: Number of columns (for grid layout)
- `gap`: Spacing between items (e.g., '1rem')
- `responsive`: Breakpoint-specific overrides
- `sections`: For tabs/accordion layouts

## Complex Examples

### Comprehensive Schema Example

```jsx
const fullExampleSchema = {
  type: 'object',
  title: 'User Profile',
  description: 'A complete example showing all supported field types',
  required: ['name', 'email', 'age'],
  properties: {
    name: {
      type: 'string',
      title: 'Full Name',
      description: 'Your full name',
      minLength: 2,
      maxLength: 100,
      isRequired: true
    },
    email: {
      type: 'string',
      format: 'email',
      title: 'Email Address',
      isRequired: true
    },
    age: {
      type: 'number',
      title: 'Age',
      minimum: 18,
      maximum: 120,
      isRequired: true
    },
    bio: {
      type: 'string',
      title: 'Biography',
      description: 'Tell us about yourself',
      widget: 'textarea'
    },
    avatar: {
      type: 'string',
      format: 'data-url',
      title: 'Profile Picture'
    },
    isAdmin: {
      type: 'boolean',
      title: 'Administrator',
      default: false
    },
    gender: {
      type: 'string',
      enum: ['male', 'female', 'other'],
      enumNames: ['Male', 'Female', 'Other']
    },
    address: {
      type: 'object',
      title: 'Address',
      properties: {
        street: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
        zip: { type: 'string', pattern: '^\\d{5}(-\\d{4})?$' }
      }
    },
    phoneNumbers: {
      type: 'array',
      title: 'Phone Numbers',
      items: {
        type: 'string',
        pattern: '^\\+?[0-9]{10,15}$'
      }
    },
    preferences: {
      type: 'object',
      title: 'Preferences',
      properties: {
        newsletter: {
          type: 'boolean',
          title: 'Subscribe to newsletter',
          default: true
        },
        notifications: {
          type: 'string',
          enum: ['none', 'email', 'sms'],
          enumNames: ['No notifications', 'Email notifications', 'SMS notifications'],
          default: 'email'
        }
      }
    }
  }
};
```

### Array of Objects (ArrayOfObjectField)

The library fully supports arrays of objects with nested properties. Here's a detailed example:

```jsx
const employeeSchema = {
  type: 'object', 
  properties: {
    team: {
      type: 'array',
      title: 'Team Members',
      description: 'Add your team members',
      minItems: 1,
      items: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: {
            type: 'string',
            title: 'Full Name'
          },
          email: {
            type: 'string',
            format: 'email',
            title: 'Work Email'
          },
          department: {
            type: 'string',
            enum: ['Engineering', 'Design', 'Product', 'Marketing'],
            default: 'Engineering'
          },
          isManager: {
            type: 'boolean',
            title: 'Is Team Lead'
          },
          skills: {
            type: 'array',
            title: 'Technical Skills',
            items: {
              type: 'string',
              enum: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'UI/UX']
            }
          },
          startDate: {
            type: 'string',
            format: 'date',
            title: 'Start Date'
          }
        }
      }
    }
  }
};

function TeamForm() {
  return (
    <SchemaRenderer 
      schema={employeeSchema}
      onSubmit={(data) => console.log('Team data:', data)}
    />
  );
}
```

Key features:
- Nested object validation
- Required fields within array items
- Mixed field types (string, boolean, enum, date)
- Arrays within array items (nested arrays)
- Default values for fields
- Custom titles and descriptions

### Conditional Fields (oneOf)

```jsx
const conditionalSchema = {
  type: 'object',
  properties: {
    contactMethod: {
      type: 'string',
      enum: ['email', 'phone']
    },
    contactDetails: {
      oneOf: [
        {
          title: 'Email',
          properties: {
            email: { type: 'string', format: 'email' }
          },
          required: ['email']
        },
        {
          title: 'Phone',
          properties: {
            phone: { type: 'string', pattern: '^\\+?[0-9]{10,15}$' },
            preferredTime: { type: 'string', enum: ['morning', 'afternoon', 'evening'] }
          },
          required: ['phone']
        }
      ]
    }
  }
};
```

## API Reference

### SchemaRenderer Props

| Prop | Type | Description |
|------|------|-------------|
| `schema` | Object | Required JSON schema |
| `value` | Object | Initial form values |
| `onChange` | Function | Callback when values change |
| `onSubmit` | Function | Form submission handler |
| `layout` | Object | Layout configuration |
| `theme` | Object | Theme override (optional) |
| `fieldComponents` | Object | Custom field components |

### ThemeProvider Props

| Prop | Type | Description |
|------|------|-------------|
| `initialTheme` | Object/string | Initial theme object or JSON string |
| `themeUrl` | string | URL to load theme from |
| `children` | ReactNode | Child components |

## Limitations

### Form Schema Limitations
- Conditional logic beyond `oneOf`/`allOf`/`anyOf` is not supported
- Dynamic schema updates after initial render have limited support
- File upload handling requires custom implementation
- Custom validation functions must be provided via props
- Complex array operations (sorting, nested arrays) may have performance impacts
- Internationalization (i18n) support is basic (labels only)

### Theme Schema Limitations
- Theme variants (dark/light mode) require manual implementation
- Custom component styling beyond the theme structure isn't supported
- Animation/transition properties aren't themeable
- Responsive design must be handled via layout properties
- Browser-specific styling isn't automatically handled

## Troubleshooting

**Q: My theme isn't applying correctly**
- Verify your theme matches the required structure
- Check for validation errors in console
- Ensure ThemeProvider wraps your SchemaRenderer

**Q: Complex schemas render slowly**
- Consider breaking into multiple forms/pages
- Use `oneOf` for conditional sections
- Avoid deeply nested structures when possible

## Contributing

We welcome contributions! Please:
1. Open an issue to discuss proposed changes
2. Follow existing code style
3. Include tests for new features
4. Update documentation

## Versioning

This project follows [Semantic Versioning](https://semver.org/). Current version (0.x) means:
- Breaking changes may occur in minor versions
- APIs are not considered stable

For help, please check GitHub Discussions or open an issue.
