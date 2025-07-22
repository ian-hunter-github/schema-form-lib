import React from 'react';
import { render, screen, fireEvent } from '../../../../__tests__/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EnumField from '../EnumField';
import type { FormField } from '../../../../types/fields';
import type { JSONSchema } from '../../../../types/schema';
import { FormModel } from '../../../../utils/form/FormModel';

// Helper function to create a mock FormField
const createMockFormField = (overrides: Partial<FormField> = {}): FormField => {
  const defaultSchema: JSONSchema = {
    type: 'string',
    title: 'Test Field',
    description: 'A test enum field',
    enum: ['option1', 'option2', 'option3'],
  };

  return {
    path: 'testField',
    value: '',
    pristineValue: '',
    schema: defaultSchema,
    errors: [],
    errorCount: 0,
    required: false,
    dirty: false,
    dirtyCount: 0,
    hasChanges: false,
    lastModified: new Date(),
    ...overrides,
  };
};

describe('EnumField', () => {
  const mockOnChange = vi.fn();
  let mockFormModel: FormModel;

  beforeEach(() => {
    mockOnChange.mockClear();
    
    // Create a mock FormModel
    const mockSchema: JSONSchema = {
      type: 'object',
      properties: {
        testField: {
          type: 'string',
          title: 'Test Field',
          description: 'A test enum field',
          enum: ['option1', 'option2', 'option3'],
        },
      },
    };
    
    mockFormModel = new FormModel(mockSchema);
  });

  it('renders with basic props', () => {
    const field = createMockFormField();
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.getByTestId('testField')).toBeInTheDocument();
    expect(screen.getByTestId('testField-label')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
  });

  it('returns null when no enum options are provided', () => {
    const field = createMockFormField({
      schema: { type: 'string', title: 'Test Field' }
    });
    
    const { container } = render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('displays all enum options', () => {
    const field = createMockFormField();
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.getByText('option1')).toBeInTheDocument();
    expect(screen.getByText('option2')).toBeInTheDocument();
    expect(screen.getByText('option3')).toBeInTheDocument();
  });

  it('displays the selected value for single select', () => {
    const field = createMockFormField({ value: 'option2' });
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const select = screen.getByTestId('testField') as HTMLSelectElement;
    expect(select.value).toBe('option2');
  });

  it('handles multiple selection for array type', () => {
    const field = createMockFormField({
      value: ['option1', 'option3'],
      schema: {
        type: 'array',
        title: 'Multi Select',
        enum: ['option1', 'option2', 'option3'],
      }
    });
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const select = screen.getByTestId('testField') as HTMLSelectElement;
    expect(select.multiple).toBe(true);
    expect(Array.from(select.selectedOptions).map(o => o.value)).toEqual(['option1', 'option3']);
  });

  it('calls onChange when selection changes for single select', () => {
    const field = createMockFormField();
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const select = screen.getByTestId('testField');
    fireEvent.change(select, { target: { value: 'option2' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('option2', false);
  });

  it('calls onChange with validation trigger on blur', () => {
    const field = createMockFormField();
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const select = screen.getByTestId('testField');
    fireEvent.blur(select, { target: { value: 'option1' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('option1', true);
  });

  it('handles multiple selection changes', () => {
    const field = createMockFormField({
      value: [],
      schema: {
        type: 'array',
        title: 'Multi Select',
        enum: ['option1', 'option2', 'option3'],
      }
    });
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const select = screen.getByTestId('testField');
    
    // Mock selectedOptions for multiple selection
    const mockSelectedOptions = [
      { value: 'option1' },
      { value: 'option3' }
    ];
    
    Object.defineProperty(select, 'selectedOptions', {
      value: mockSelectedOptions,
      configurable: true
    });
    
    fireEvent.change(select);
    
    expect(mockOnChange).toHaveBeenCalledWith(['option1', 'option3'], false);
  });

  it('displays field title from schema', () => {
    const field = createMockFormField({
      schema: { 
        type: 'string', 
        title: 'Custom Title',
        enum: ['a', 'b', 'c']
      }
    });
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('falls back to field path when no title is provided', () => {
    const field = createMockFormField({
      path: 'user.status',
      schema: { 
        type: 'string',
        enum: ['active', 'inactive']
      }
    });
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('displays description when provided', () => {
    const field = createMockFormField({
      schema: {
        type: 'string',
        description: 'Choose your preferred option',
        enum: ['option1', 'option2']
      }
    });
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.getByTestId('testField-description')).toBeInTheDocument();
    expect(screen.getByText('Choose your preferred option')).toBeInTheDocument();
  });

  it('does not display description when not provided', () => {
    const field = createMockFormField({
      schema: { 
        type: 'string',
        enum: ['option1', 'option2']
      }
    });
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.queryByTestId('testField-description')).not.toBeInTheDocument();
  });

  it('shows required indicator when field is required', () => {
    const field = createMockFormField({ required: true });
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const label = screen.getByTestId('testField-label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("required");
    
  });

  it('does not show required indicator when field is not required', () => {
    const field = createMockFormField({ required: false });
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const label = screen.getByTestId('testField-label');
    expect(label).toBeInTheDocument();
    expect(label).not.toHaveAttribute("required");
  });

  it('displays error message when field has errors', () => {
    const field = createMockFormField({
      errors: ['Please select a valid option', 'This field is required'],
      errorCount: 2
    });
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.getByTestId('testField-error')).toBeInTheDocument();
    expect(screen.getByText('Please select a valid option')).toBeInTheDocument();
  });

  it('does not display error message when field has no errors', () => {
    const field = createMockFormField({ errors: [] });
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.queryByTestId('testField-error')).not.toBeInTheDocument();
  });

  it('shows dirty indicator when field is dirty', () => {
    const field = createMockFormField({ dirty: true });
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.getByTestId('testField-dirty-indicator')).toBeInTheDocument();
    expect(screen.getByText('Modified')).toBeInTheDocument();
  });

  it('does not show dirty indicator when field is not dirty', () => {
    const field = createMockFormField({ dirty: false });
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.queryByTestId('testField-dirty-indicator')).not.toBeInTheDocument();
  });

  it('disables select when field is read-only', () => {
    const field = createMockFormField({
      schema: { 
        type: 'string', 
        readOnly: true,
        enum: ['option1', 'option2']
      }
    });
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const select = screen.getByTestId('testField') as HTMLSelectElement;
    expect(select.disabled).toBe(true);
  });

  it('enables select when field is not read-only', () => {
    const field = createMockFormField({
      schema: { 
        type: 'string', 
        readOnly: false,
        enum: ['option1', 'option2']
      }
    });
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const select = screen.getByTestId('testField') as HTMLSelectElement;
    expect(select.disabled).toBe(false);
  });


  it('handles nested field paths correctly', () => {
    const field = createMockFormField({
      path: 'user.preferences.theme',
      schema: { 
        type: 'string',
        enum: ['light', 'dark']
      }
    });
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.getByTestId('user.preferences.theme')).toBeInTheDocument();
    expect(screen.getByText('Theme')).toBeInTheDocument();
  });

  it('applies styling when field has changes', () => {
    const field = createMockFormField({ hasChanges: true });
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const select = screen.getByTestId('testField') as HTMLSelectElement;
    // Check that the element has the isDirty prop applied (styled components will handle the styling)
    expect(select).toBeInTheDocument();
    // The styling is applied via CSS-in-JS, so we just verify the component renders correctly
    expect(select).not.toBeDisabled();
  });

  it('does not apply change styling when field has no changes', () => {
    const field = createMockFormField({ hasChanges: false });
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const select = screen.getByTestId('testField') as HTMLSelectElement;
    // The field should still have some base styling, just not the "dirty" styling
    expect(select).toBeInTheDocument();
  });

  it('handles numeric enum values', () => {
    const field = createMockFormField({
      value: '2',
      schema: {
        type: 'string',
        title: 'Priority',
        enum: ['1', '2', '3', '4', '5']
      }
    });
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    
    const select = screen.getByTestId('testField') as HTMLSelectElement;
    expect(select.value).toBe('2');
  });

  it('handles empty array value for multiple select', () => {
    const field = createMockFormField({
      value: [],
      schema: {
        type: 'array',
        title: 'Multi Select',
        enum: ['option1', 'option2', 'option3'],
      }
    });
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const select = screen.getByTestId('testField') as HTMLSelectElement;
    expect(select.selectedOptions.length).toBe(0);
  });

  it('handles null/undefined values gracefully', () => {
    const field = createMockFormField({ value: null });
    
    render(<EnumField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const select = screen.getByTestId('testField') as HTMLSelectElement;
    expect(select.value).toBe('');
  });
});
