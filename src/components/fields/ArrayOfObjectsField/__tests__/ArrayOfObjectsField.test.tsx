import React from 'react';
import { render, screen, fireEvent } from '../../../../__tests__/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ArrayOfObjectsField from '../ArrayOfObjectsField';
import type { FormField } from '../../../../types/fields';
import type { FormModel } from '../../../../utils/form/FormModel';
import type { JSONSchema, JSONValue } from '../../../../types/schema';

// Mock the FieldRenderer to avoid circular dependencies in tests
vi.mock('../../../FieldRenderer', () => ({
  default: ({ field, onChange }: { field: FormField; onChange: (value: JSONValue) => void }) => (
    <div data-testid={`mock-field-${field.path}`}>
      <input
        data-testid={`mock-input-${field.path}`}
        value={field.value?.toString() || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}));

describe('ArrayOfObjectsField', () => {
  let mockFormModel: FormModel;
  let mockField: FormField;
  let mockOnChange: ReturnType<typeof vi.fn>;

  const createMockSchema = (): JSONSchema => ({
    type: 'array',
    title: 'Test Array',
    description: 'Test array description',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name' },
        age: { type: 'number', title: 'Age' },
        active: { type: 'boolean', title: 'Active' }
      },
      isRequired: true
    }
  });

  beforeEach(() => {
    mockOnChange = vi.fn();
    
    mockFormModel = {
      addValue: vi.fn(),
      deleteValue: vi.fn(),
      setValue: vi.fn(),
      validate: vi.fn(),
      getField: vi.fn()
    } as unknown as FormModel;

    mockField = {
      path: 'testArray',
      schema: createMockSchema(),
      value: [],
      pristineValue: [],
      errors: [],
      errorCount: 0,
      dirty: false,
      dirtyCount: 0,
      hasChanges: false,
      required: false,
      lastModified: new Date()
    };
  });

  it('renders empty array with placeholder message', () => {
    render(
      <ArrayOfObjectsField
        field={mockField}
        formModel={mockFormModel}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Test Array')).toBeInTheDocument();
    expect(screen.getByText('Test array description')).toBeInTheDocument();
    expect(screen.getByText('No items added yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
  });

  it('renders array with existing items', () => {
    const fieldWithItems = {
      ...mockField,
      value: [
        { name: 'John', age: 30, active: true },
        { name: 'Jane', age: 25, active: false }
      ]
    };

    vi.mocked(mockFormModel.getField).mockImplementation((path: string) => {
      const baseField: FormField = {
        path,
        value: '',
        pristineValue: '',
        errors: [],
        errorCount: 0,
        dirty: false,
        dirtyCount: 0,
        hasChanges: false,
        required: false,
        lastModified: new Date(),
        schema: { type: 'string' }
      };

      if (path === 'testArray.0') {
        return { 
          ...baseField,
          path,
          value: { name: 'John', age: 30, active: true },
          schema: { type: 'object' }
        };
      }
      if (path === 'testArray.1') {
        return { 
          ...baseField,
          path,
          value: { name: 'Jane', age: 25, active: false },
          schema: { type: 'object' }
        };
      }
      if (path.includes('.name') || path.includes('.age') || path.includes('.active')) {
        return { ...baseField, path, value: '' };
      }
      return { ...baseField, path };
    });

    render(
      <ArrayOfObjectsField
        field={fieldWithItems}
        formModel={mockFormModel}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.queryByText('No items added yet')).not.toBeInTheDocument();
  });

  it('calls addValue when Add Item button is clicked', () => {
    render(
      <ArrayOfObjectsField
        field={mockField}
        formModel={mockFormModel}
        onChange={mockOnChange}
      />
    );

    const addButton = screen.getByRole('button', { name: 'Add Item' });
    fireEvent.click(addButton);

    expect(mockFormModel.addValue).toHaveBeenCalledWith('testArray', {
      name: '',
      age: 0,
      active: false
    });
  });

  it('handles undefined item schema gracefully', () => {
    const fieldWithUndefinedSchema = {
      ...mockField,
      schema: {
        ...mockField.schema,
        items: undefined
      }
    };

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ArrayOfObjectsField
        field={fieldWithUndefinedSchema}
        formModel={mockFormModel}
        onChange={mockOnChange}
      />
    );

    const addButton = screen.getByRole('button', { name: 'Add Item' });
    fireEvent.click(addButton);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Cannot add item - array item schema is undefined');
    expect(mockFormModel.addValue).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('handles errors during item addition', () => {
    const error = new Error('Failed to add item');
    vi.mocked(mockFormModel.addValue).mockImplementation(() => {
      throw error;
    });
    
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ArrayOfObjectsField
        field={mockField}
        formModel={mockFormModel}
        onChange={mockOnChange}
      />
    );

    const addButton = screen.getByRole('button', { name: 'Add Item' });
    fireEvent.click(addButton);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to add array item:', error);
    consoleErrorSpy.mockRestore();
  });

  it('calls deleteValue when Remove button is clicked', () => {
    const fieldWithItems = {
      ...mockField,
      value: [{ name: 'John', age: 30, active: true }]
    };

    vi.mocked(mockFormModel.getField).mockImplementation((path: string) => {
      const baseField: FormField = {
        path,
        value: '',
        pristineValue: '',
        errors: [],
        errorCount: 0,
        dirty: false,
        dirtyCount: 0,
        hasChanges: false,
        required: false,
        lastModified: new Date(),
        schema: { type: 'string' }
      };

      if (path === 'testArray.0') {
        return { 
          ...baseField,
          path,
          value: { name: 'John', age: 30, active: true },
          schema: { type: 'object' }
        };
      }
      return { ...baseField, path };
    });

    render(
      <ArrayOfObjectsField
        field={fieldWithItems}
        formModel={mockFormModel}
        onChange={mockOnChange}
      />
    );

    const removeButton = screen.getByTestId('testArray.0-remove');
    fireEvent.click(removeButton);

    expect(mockFormModel.deleteValue).toHaveBeenCalledWith('testArray.0');
  });

  it('expands and collapses items when header is clicked', () => {
    const fieldWithItems = {
      ...mockField,
      value: [{ name: 'John', age: 30, active: true }]
    };

    vi.mocked(mockFormModel.getField).mockImplementation((path: string) => {
      const baseField: FormField = {
        path,
        value: '',
        pristineValue: '',
        errors: [],
        errorCount: 0,
        dirty: false,
        dirtyCount: 0,
        hasChanges: false,
        required: false,
        lastModified: new Date(),
        schema: { type: 'string' }
      };

      if (path === 'testArray.0') {
        return { 
          ...baseField,
          path,
          value: { name: 'John', age: 30, active: true },
          schema: { type: 'object' }
        };
      }
      if (path.startsWith('testArray.0.')) {
        return { ...baseField, path, value: '' };
      }
      return { ...baseField, path };
    });

    render(
      <ArrayOfObjectsField
        field={fieldWithItems}
        formModel={mockFormModel}
        onChange={mockOnChange}
      />
    );

    const itemHeader = screen.getByText('Item 1').closest('div');
    expect(itemHeader).toBeInTheDocument();

    // Initially collapsed - no mock fields should be visible
    expect(screen.queryByTestId('mock-field-testArray.0.name')).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(itemHeader!);

    // Should now show the nested fields
    expect(screen.getByTestId('mock-field-testArray.0.name')).toBeInTheDocument();
    expect(screen.getByTestId('mock-field-testArray.0.age')).toBeInTheDocument();
    expect(screen.getByTestId('mock-field-testArray.0.active')).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(itemHeader!);

    // Should hide the nested fields again
    expect(screen.queryByTestId('mock-field-testArray.0.name')).not.toBeInTheDocument();
  });

  it('displays error message when field has errors', () => {
    const fieldWithError = {
      ...mockField,
      errors: ['This field is required']
    };

    render(
      <ArrayOfObjectsField
        field={fieldWithError}
        formModel={mockFormModel}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('displays dirty indicator when field is dirty', () => {
    const dirtyField = {
      ...mockField,
      dirty: true
    };

    render(
      <ArrayOfObjectsField
        field={dirtyField}
        formModel={mockFormModel}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Modified')).toBeInTheDocument();
  });

  it('disables buttons when field is readOnly', () => {
    const readOnlyField = {
      ...mockField,
      schema: {
        ...mockField.schema,
        readOnly: true
      },
      value: [{ name: 'John', age: 30, active: true }]
    };

    vi.mocked(mockFormModel.getField).mockImplementation((path: string) => {
      const baseField: FormField = {
        path,
        value: '',
        pristineValue: '',
        errors: [],
        errorCount: 0,
        dirty: false,
        dirtyCount: 0,
        hasChanges: false,
        required: false,
        lastModified: new Date(),
        schema: { type: 'string' }
      };

      if (path === 'testArray.0') {
        return { 
          ...baseField,
          path,
          value: { name: 'John', age: 30, active: true },
          schema: { type: 'object' }
        };
      }
      return { ...baseField, path };
    });

    render(
      <ArrayOfObjectsField
        field={readOnlyField}
        formModel={mockFormModel}
        onChange={mockOnChange}
      />
    );

    const addButton = screen.getByRole('button', { name: 'Add Item' });
    const removeButton = screen.getByTestId('testArray.0-remove');

    expect(addButton).toBeDisabled();
    expect(removeButton).toBeDisabled();
  });

  it('handles nested field changes correctly', async () => {
    const fieldWithItems = {
      ...mockField,
      value: [{ name: 'John', age: 30, active: true }]
    };

    vi.mocked(mockFormModel.getField).mockImplementation((path: string) => {
      const baseField: FormField = {
        path,
        value: '',
        pristineValue: '',
        errors: [],
        errorCount: 0,
        dirty: false,
        dirtyCount: 0,
        hasChanges: false,
        required: false,
        lastModified: new Date(),
        schema: { type: 'string' }
      };

      if (path === 'testArray.0') {
        return { 
          ...baseField,
          path,
          value: { name: 'John', age: 30, active: true },
          schema: { type: 'object' }
        };
      }
      if (path === 'testArray.0.name') {
        return { ...baseField, path, value: 'John' };
      }
      return { ...baseField, path };
    });

    render(
      <ArrayOfObjectsField
        field={fieldWithItems}
        formModel={mockFormModel}
        onChange={mockOnChange}
      />
    );

    // Expand the item first
    const itemHeader = screen.getByText('Item 1').closest('div');
    fireEvent.click(itemHeader!);

    // Find and interact with the nested field
    const nameInput = screen.getByTestId('mock-input-testArray.0.name');
    fireEvent.change(nameInput, { target: { value: 'Jane' } });

    expect(mockFormModel.setValue).toHaveBeenCalledWith('testArray.0.name', 'Jane');
  });

  it('creates default values based on schema types', () => {
    const schemaWithDefaults: JSONSchema = {
      ...createMockSchema(),
      items: {
        type: 'object' as const,
        properties: {
          stringField: { type: 'string' as const, default: 'default string' },
          numberField: { type: 'number' as const },
          booleanField: { type: 'boolean' as const },
          arrayField: { type: 'array' as const },
          objectField: { type: 'object' as const }
        }
      }
    };

    const fieldWithCustomSchema = {
      ...mockField,
      schema: schemaWithDefaults
    };

    render(
      <ArrayOfObjectsField
        field={fieldWithCustomSchema}
        formModel={mockFormModel}
        onChange={mockOnChange}
      />
    );

    const addButton = screen.getByRole('button', { name: 'Add Item' });
    fireEvent.click(addButton);

    expect(mockFormModel.addValue).toHaveBeenCalledWith('testArray', {
      stringField: 'default string',
      numberField: 0,
      booleanField: false,
      arrayField: [],
      objectField: {}
    });
  });
});
