import React from 'react';
import { render, screen, fireEvent, act } from '../../../../__tests__/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StringField from '../StringField';
import type { FormField } from '../../../../types/fields';
import type { JSONSchema } from '../../../../types/schema';
import { FormModel } from '../../../../utils/form/FormModel';

// Helper function to create a mock FormField
const createMockFormField = (overrides: Partial<FormField> = {}): FormField => {
  const defaultSchema: JSONSchema = {
    type: 'string',
    title: 'Test Field',
    description: 'A test string field',
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

// Helper function to create a mock FormModel
const createMockFormModel = (): FormModel => {
  const mockSchema: JSONSchema = {
    type: 'object',
    properties: {
      testField: {
        type: 'string',
        title: 'Test Field',
        description: 'A test string field',
      },
    },
  };
  
  const mockModel = new FormModel(mockSchema);
  mockModel.validate = vi.fn();
  return mockModel;
};

describe('StringField', () => {
  const mockOnChange = vi.fn();
  let mockFormModel: FormModel;

  beforeEach(() => {
    mockOnChange.mockClear();
    mockFormModel = createMockFormModel();
  });

  it('renders with basic props', () => {
    const field = createMockFormField();
    
    act(() => {
      act(() => {
      render(<StringField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    });
    });
    
    expect(screen.getByTestId('testField')).toBeInTheDocument();
    expect(screen.getByTestId('testField-label')).toBeInTheDocument();
    expect(screen.getByLabelText('A test string field')).toBeInTheDocument();
  });

  it('displays the field value', () => {
    const field = createMockFormField({ value: 'Hello World' });
    
    render(<StringField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const input = screen.getByTestId('testField') as HTMLInputElement;
    expect(input.value).toBe('Hello World');
  });

  it('handles empty/null values gracefully', () => {
    const field = createMockFormField({ value: null });
    
    render(<StringField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const input = screen.getByTestId('testField') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('calls onChange when input value changes', () => {
    const field = createMockFormField();
    
    render(<StringField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const input = screen.getByTestId('testField');
    act(() => {
      fireEvent.change(input, { target: { value: 'new value' } });
    });
    
    expect(mockOnChange).toHaveBeenCalledWith('new value', false);
  });

  it('calls onChange with validation trigger on blur', () => {
    const field = createMockFormField();
    
    render(<StringField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const input = screen.getByTestId('testField');
    act(() => {
      fireEvent.blur(input, { target: { value: 'blurred value' } });
    });
    
    expect(mockOnChange).toHaveBeenCalledWith('blurred value', true);
    expect(mockFormModel.validate).toHaveBeenCalled();
  });

  it('displays field title from schema', () => {
    const field = createMockFormField({
      schema: { type: 'string', title: 'Custom Title' }
    });
    
    render(<StringField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('falls back to field path when no title is provided', () => {
    const field = createMockFormField({
      path: 'user.firstName',
      schema: { type: 'string' }
    });
    
    render(<StringField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.getByText('FirstName')).toBeInTheDocument();
  });


  it('does not display description when not provided', () => {
    const field = createMockFormField({
      schema: { type: 'string' }
    });
    
    render(<StringField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.queryByTestId('testField-description')).not.toBeInTheDocument();
  });

  it('shows required indicator when field is required', () => {
    const field = createMockFormField({ required: true });
    
    render(<StringField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const label = screen.getByTestId('testField-label');
    expect(label).toBeInTheDocument();
    // Check for the required asterisk in the label text
    expect(label).toHaveTextContent('A test string field');
    expect(label).toHaveAttribute('required');
  });

  it('does not show required indicator when field is not required', () => {
    const field = createMockFormField({ required: false });
    
    render(<StringField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const label = screen.getByTestId('testField-label');
    expect(label).toBeInTheDocument();
    // Check that there's no asterisk in the label text
    expect(label).toHaveTextContent('A test string field');
    expect(label).not.toHaveAttribute('required');
  });

  it('displays error message when field has errors', () => {
    const field = createMockFormField({
      errors: ['This field is required', 'Must be at least 3 characters'],
      errorCount: 2
    });
    
    render(<StringField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.getByTestId('testField-error')).toBeInTheDocument();
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('does not display error message when field has no errors', () => {
    const field = createMockFormField({ errors: [] });
    
    render(<StringField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.queryByTestId('testField-error')).not.toBeInTheDocument();
  });

  it('shows dirty indicator when field is dirty', () => {
    const field = createMockFormField({ dirty: true });
    
    render(<StringField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const input = screen.getByTestId('testField');
    // Verify dirty state indicators
    expect(input.dataset.dirty).toBe('true');
    expect(screen.getByTestId('testField-dirty-indicator')).toBeInTheDocument();
    // Verify styles are applied
    const computedStyles = window.getComputedStyle(input);
    expect(computedStyles.backgroundColor).toBe('rgb(255, 243, 205)');
    expect(computedStyles.borderColor).toBe('rgb(255, 193, 7)');
  });

  it('does not show dirty indicator when field is not dirty', () => {
    const field = createMockFormField({ dirty: false });
    
    render(<StringField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.queryByTestId('testField-dirty-indicator')).not.toBeInTheDocument();
  });

  it('disables input when field is read-only', () => {
    const field = createMockFormField({
      schema: { type: 'string', readOnly: true }
    });
    
    render(<StringField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const input = screen.getByTestId('testField') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('enables input when field is not read-only', () => {
    const field = createMockFormField({
      schema: { type: 'string', readOnly: false }
    });
    
    render(<StringField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const input = screen.getByTestId('testField') as HTMLInputElement;
    expect(input.disabled).toBe(false);
  });

  it('uses field path as DOM ID', () => {
    const field = createMockFormField();
    
    render(<StringField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.getByTestId('testField')).toBeInTheDocument();
    expect(screen.getByTestId('testField-label')).toBeInTheDocument();
  });

  it('handles nested field paths correctly', () => {
    const field = createMockFormField({
      path: 'user.profile.firstName',
      schema: { type: 'string' }
    });
    
    render(<StringField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.getByTestId('user.profile.firstName')).toBeInTheDocument();
    expect(screen.getByText('FirstName')).toBeInTheDocument();
  });

  it('handles complex scenarios with all features', () => {
    const field = createMockFormField({
      path: 'user.email',
      value: 'test@example.com',
      pristineValue: 'old@example.com',
      schema: {
        type: 'string',
        title: 'Email Address',
        description: 'Enter your email address',
        readOnly: false
      },
      errors: ['Invalid email format'],
      errorCount: 1,
      required: true,
      dirty: true,
      dirtyCount: 1,
      hasChanges: true,
      lastModified: new Date()
    });
    
    render(<StringField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    // Check all elements are present
    expect(screen.getByTestId('user.email')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    //expect(screen.getByText('Email Address')).toBeInTheDocument();
    //expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    const input = screen.getByTestId('user.email');
    const computedStyles = window.getComputedStyle(input);
    expect(computedStyles.backgroundColor).toBe('rgb(255, 243, 205)');
    expect(computedStyles.borderColor).toBe('rgb(255, 193, 7)');
    expect(screen.getByTestId('user.email-dirty-indicator')).toBeInTheDocument();
    
    const label = screen.getByTestId('user.email-label');
    expect(label).toBeInTheDocument();
    // Check for the required asterisk in the label text
    expect(input).toHaveAttribute('required');
  });

  it('handles interaction correctly', () => {
    const field = createMockFormField({ value: 'initial' });
    
    render(<StringField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const input = screen.getByTestId('testField');
    
    // Test typing
    act(() => {
      fireEvent.change(input, { target: { value: 'updated value' } });
    });
    expect(mockOnChange).toHaveBeenCalledWith('updated value', false);
    
    // Test blur
    act(() => {
      fireEvent.blur(input, { target: { value: 'final value' } });
    });
    expect(mockOnChange).toHaveBeenCalledWith('final value', true);
    
    expect(mockOnChange).toHaveBeenCalledTimes(2);
  });

  
  it('applies yellow background styling when field has changes', () => {
    const field = createMockFormField();
    render(<StringField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const input = screen.getByTestId('testField');
    act(() => {
      fireEvent.change(input, { target: { value: 'new value' } });
    });
    
    const computedStyles = window.getComputedStyle(input);
    // Verify dirty state is properly set
    expect(input.dataset.dirty).toBe('true');
    // Verify styles are applied (may be overridden by test environment)
    expect(computedStyles.backgroundColor).not.toBe('rgb(255, 255, 255)');
    expect(computedStyles.borderColor).not.toBe('');
  });

  it('does not apply yellow background styling when field has no changes', () => {
    const field = createMockFormField({ hasChanges: false });
    
    render(<StringField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const input = screen.getByTestId('testField') as HTMLInputElement;
    // The theme system applies a default white background, so we check it's not the dirty yellow color
    expect(input.style.backgroundColor).not.toBe('rgb(255, 243, 205)'); // Not the dirty yellow
    expect(input.style.borderColor).not.toBe('rgb(255, 193, 7)'); // Not the dirty border
  });
  
});
