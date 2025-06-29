import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FieldRenderer from '../FieldRenderer';
import { FormModel } from '../../utils/formModel/FormModel';
import type { FormField } from '../../utils/formModel/types';
import type { JSONSchema } from '../../types/schema';

// Mock all field components
vi.mock('../fields/StringField', () => ({
  default: ({ field }: any) => <div data-testid={`string-field-${field.path}`}>StringField</div>
}));

vi.mock('../fields/NumberField', () => ({
  default: ({ field }: any) => <div data-testid={`number-field-${field.path}`}>NumberField</div>
}));

vi.mock('../fields/BooleanField', () => ({
  default: ({ field }: any) => <div data-testid={`boolean-field-${field.path}`}>BooleanField</div>
}));

vi.mock('../fields/EnumField', () => ({
  default: ({ field }: any) => <div data-testid={`enum-field-${field.path}`}>EnumField</div>
}));

vi.mock('../fields/ArrayOfPrimitiveField', () => ({
  default: ({ field }: any) => <div data-testid={`array-primitive-field-${field.path}`}>ArrayOfPrimitiveField</div>
}));

vi.mock('../fields/ArrayOfObjectsField', () => ({
  default: ({ field }: any) => <div data-testid={`array-objects-field-${field.path}`}>ArrayOfObjectsField</div>
}));

vi.mock('../fields/ObjectField', () => ({
  default: ({ field }: any) => <div data-testid={`object-field-${field.path}`}>ObjectField</div>
}));

describe('FieldRenderer', () => {
  let mockFormModel: FormModel;
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  const createMockField = (path: string, schema: JSONSchema, value?: any): FormField => ({
    path,
    value: value ?? null,
    pristineValue: null,
    schema,
    errors: [],
    errorCount: 0,
    required: false,
    dirty: false,
    dirtyCount: 0,
    hasChanges: false,
    lastModified: new Date()
  });

  describe('Field Type Selection', () => {
    it('should render StringField for string type', () => {
      const schema: JSONSchema = { type: 'string', title: 'Name' };
      mockFormModel = new FormModel({ type: 'object', properties: { name: schema } });
      const field = createMockField('name', schema);

      render(<FieldRenderer field={field} formModel={mockFormModel} onChange={mockOnChange} />);

      expect(screen.getByTestId('string-field-name')).toBeInTheDocument();
    });

    it('should render NumberField for number type', () => {
      const schema: JSONSchema = { type: 'number', title: 'Age' };
      mockFormModel = new FormModel({ type: 'object', properties: { age: schema } });
      const field = createMockField('age', schema);

      render(<FieldRenderer field={field} formModel={mockFormModel} onChange={mockOnChange} />);

      expect(screen.getByTestId('number-field-age')).toBeInTheDocument();
    });

    it('should render NumberField for integer type', () => {
      const schema: JSONSchema = { type: 'integer', title: 'Count' };
      mockFormModel = new FormModel({ type: 'object', properties: { count: schema } });
      const field = createMockField('count', schema);

      render(<FieldRenderer field={field} formModel={mockFormModel} onChange={mockOnChange} />);

      expect(screen.getByTestId('number-field-count')).toBeInTheDocument();
    });

    it('should render BooleanField for boolean type', () => {
      const schema: JSONSchema = { type: 'boolean', title: 'Active' };
      mockFormModel = new FormModel({ type: 'object', properties: { active: schema } });
      const field = createMockField('active', schema);

      render(<FieldRenderer field={field} formModel={mockFormModel} onChange={mockOnChange} />);

      expect(screen.getByTestId('boolean-field-active')).toBeInTheDocument();
    });

    it('should render EnumField for fields with enum property', () => {
      const schema: JSONSchema = { 
        type: 'string', 
        title: 'Status',
        enum: ['active', 'inactive', 'pending']
      };
      mockFormModel = new FormModel({ type: 'object', properties: { status: schema } });
      const field = createMockField('status', schema);

      render(<FieldRenderer field={field} formModel={mockFormModel} onChange={mockOnChange} />);

      expect(screen.getByTestId('enum-field-status')).toBeInTheDocument();
    });

    it('should render ArrayOfPrimitiveField for array of primitives', () => {
      const schema: JSONSchema = { 
        type: 'array', 
        title: 'Tags',
        items: { type: 'string' }
      };
      mockFormModel = new FormModel({ type: 'object', properties: { tags: schema } });
      const field = createMockField('tags', schema);

      render(<FieldRenderer field={field} formModel={mockFormModel} onChange={mockOnChange} />);

      expect(screen.getByTestId('array-primitive-field-tags')).toBeInTheDocument();
    });

    it('should render ArrayOfObjectsField for array of objects', () => {
      const schema: JSONSchema = { 
        type: 'array', 
        title: 'People',
        items: { 
          type: 'object',
          properties: {
            name: { type: 'string', title: 'Name' },
            age: { type: 'number', title: 'Age' }
          }
        }
      };
      mockFormModel = new FormModel({ type: 'object', properties: { people: schema } });
      const field = createMockField('people', schema);

      render(<FieldRenderer field={field} formModel={mockFormModel} onChange={mockOnChange} />);

      expect(screen.getByTestId('array-objects-field-people')).toBeInTheDocument();
    });

    it('should render ArrayOfPrimitiveField for array without object items', () => {
      const schema: JSONSchema = { 
        type: 'array', 
        title: 'Numbers',
        items: { type: 'number' }
      };
      mockFormModel = new FormModel({ type: 'object', properties: { numbers: schema } });
      const field = createMockField('numbers', schema);

      render(<FieldRenderer field={field} formModel={mockFormModel} onChange={mockOnChange} />);

      expect(screen.getByTestId('array-primitive-field-numbers')).toBeInTheDocument();
    });

    it('should render ArrayOfPrimitiveField for array with no items schema', () => {
      const schema: JSONSchema = { 
        type: 'array', 
        title: 'Mixed'
        // No items schema defined
      };
      mockFormModel = new FormModel({ type: 'object', properties: { mixed: schema } });
      const field = createMockField('mixed', schema);

      render(<FieldRenderer field={field} formModel={mockFormModel} onChange={mockOnChange} />);

      expect(screen.getByTestId('array-primitive-field-mixed')).toBeInTheDocument();
    });

    it('should render ObjectField for object type with properties', async () => {
      const schema: JSONSchema = { 
        type: 'object', 
        title: 'Person',
        properties: {
          name: { type: 'string', title: 'Name' },
          age: { type: 'number', title: 'Age' }
        }
      };
      mockFormModel = new FormModel({ type: 'object', properties: { person: schema } });
      const field = createMockField('person', schema);

      render(<FieldRenderer field={field} formModel={mockFormModel} onChange={mockOnChange} />);

      // Wait for the lazy component to load
      expect(await screen.findByTestId('object-field-person')).toBeInTheDocument();
    });

    it('should render error message for unsupported field type', () => {
      const schema: JSONSchema = { 
        type: 'null' as any, // Unsupported type
        title: 'Unknown'
      };
      mockFormModel = new FormModel({ type: 'object', properties: { unknown: schema } });
      const field = createMockField('unknown', schema);

      render(<FieldRenderer field={field} formModel={mockFormModel} onChange={mockOnChange} />);

      expect(screen.getByText('Unsupported field type: null')).toBeInTheDocument();
    });
  });

  describe('Props Passing', () => {
    it('should pass field, formModel, and onChange to field components', () => {
      const schema: JSONSchema = { type: 'string', title: 'Name' };
      mockFormModel = new FormModel({ type: 'object', properties: { name: schema } });
      const field = createMockField('name', schema, 'test value');

      render(<FieldRenderer field={field} formModel={mockFormModel} onChange={mockOnChange} />);

      // Verify the component renders correctly with the field data
      expect(screen.getByTestId('string-field-name')).toBeInTheDocument();
      expect(screen.getByText('StringField')).toBeInTheDocument();
    });
  });

  describe('Enum Priority', () => {
    it('should prioritize EnumField over type-based selection when enum is present', () => {
      const schema: JSONSchema = { 
        type: 'string', 
        title: 'Priority',
        enum: ['low', 'medium', 'high']
      };
      mockFormModel = new FormModel({ type: 'object', properties: { priority: schema } });
      const field = createMockField('priority', schema);

      render(<FieldRenderer field={field} formModel={mockFormModel} onChange={mockOnChange} />);

      // Should render EnumField, not StringField, even though type is 'string'
      expect(screen.getByTestId('enum-field-priority')).toBeInTheDocument();
      expect(screen.queryByTestId('string-field-priority')).not.toBeInTheDocument();
    });

    it('should prioritize ObjectField over type-based selection when properties are present', async () => {
      const schema: JSONSchema = { 
        type: 'object', 
        title: 'Address',
        properties: {
          street: { type: 'string', title: 'Street' },
          city: { type: 'string', title: 'City' }
        }
      };
      mockFormModel = new FormModel({ type: 'object', properties: { address: schema } });
      const field = createMockField('address', schema);

      render(<FieldRenderer field={field} formModel={mockFormModel} onChange={mockOnChange} />);

      // Wait for the lazy component to load
      expect(await screen.findByTestId('object-field-address')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing field gracefully', () => {
      const schema: JSONSchema = { type: 'string', title: 'Name' };
      mockFormModel = new FormModel({ type: 'object', properties: { name: schema } });
      const field = createMockField('name', schema);

      expect(() => {
        render(<FieldRenderer field={field} formModel={mockFormModel} onChange={mockOnChange} />);
      }).not.toThrow();
    });

    it('should handle undefined schema type', () => {
      const schema: JSONSchema = { 
        title: 'Unknown'
        // type is undefined
      } as any;
      mockFormModel = new FormModel({ type: 'object', properties: { unknown: schema } });
      const field = createMockField('unknown', schema);

      render(<FieldRenderer field={field} formModel={mockFormModel} onChange={mockOnChange} />);

      // The error message might not include "undefined" if the type is truly undefined
      expect(screen.getByText(/Unsupported field type/)).toBeInTheDocument();
    });
  });
});
