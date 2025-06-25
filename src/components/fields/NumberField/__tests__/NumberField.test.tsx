import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NumberField from '../NumberField';
import type { FormField } from '../../../../utils/formModel/types';
import type { JSONSchema } from '../../../../types/schema';

// Helper function to create a mock FormField
const createMockFormField = (overrides: Partial<FormField> = {}): FormField => {
  const defaultSchema: JSONSchema = {
    type: 'number',
    title: 'Test Field',
    description: 'A test number field',
  };

  return {
    path: 'testField',
    value: 0,
    pristineValue: 0,
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

describe('NumberField', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with basic props', () => {
    const field = createMockFormField();
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    expect(screen.getByTestId('testField')).toBeInTheDocument();
    expect(screen.getByTestId('testField-label')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
  });

  it('displays the field value', () => {
    const field = createMockFormField({ value: 42 });
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    const input = screen.getByTestId('testField') as HTMLInputElement;
    expect(input.value).toBe('42');
  });

  it('handles zero value correctly', () => {
    const field = createMockFormField({ value: 0 });
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    const input = screen.getByTestId('testField') as HTMLInputElement;
    expect(input.value).toBe('0');
  });

  it('handles null/undefined values gracefully', () => {
    const field = createMockFormField({ value: null });
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    const input = screen.getByTestId('testField') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('calls onChange when input value changes', () => {
    const field = createMockFormField();
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    const input = screen.getByTestId('testField');
    fireEvent.change(input, { target: { value: '123' } });
    
    expect(mockOnChange).toHaveBeenCalledWith(123, false);
  });

  it('calls onChange with validation trigger on blur', () => {
    const field = createMockFormField();
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    const input = screen.getByTestId('testField');
    fireEvent.blur(input, { target: { value: '456' } });
    
    expect(mockOnChange).toHaveBeenCalledWith(456, true);
  });

  it('handles decimal values correctly', () => {
    const field = createMockFormField({ value: 3.14 });
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    const input = screen.getByTestId('testField') as HTMLInputElement;
    expect(input.value).toBe('3.14');
    
    fireEvent.change(input, { target: { value: '2.71' } });
    expect(mockOnChange).toHaveBeenCalledWith(2.71, false);
  });

  it('handles negative values correctly', () => {
    const field = createMockFormField({ value: -10 });
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    const input = screen.getByTestId('testField') as HTMLInputElement;
    expect(input.value).toBe('-10');
    
    fireEvent.change(input, { target: { value: '-25' } });
    expect(mockOnChange).toHaveBeenCalledWith(-25, false);
  });

  it('displays field title from schema', () => {
    const field = createMockFormField({
      schema: { type: 'number', title: 'Custom Title' }
    });
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('falls back to field path when no title is provided', () => {
    const field = createMockFormField({
      path: 'user.age',
      schema: { type: 'number' }
    });
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    expect(screen.getByText('Age')).toBeInTheDocument();
  });

  it('displays description when provided', () => {
    const field = createMockFormField({
      schema: {
        type: 'number',
        description: 'Enter your age in years'
      }
    });
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    expect(screen.getByTestId('testField-description')).toBeInTheDocument();
    expect(screen.getByText('Enter your age in years')).toBeInTheDocument();
  });

  it('does not display description when not provided', () => {
    const field = createMockFormField({
      schema: { type: 'number' }
    });
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    expect(screen.queryByTestId('testField-description')).not.toBeInTheDocument();
  });

  it('shows required indicator when field is required', () => {
    const field = createMockFormField({ required: true });
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    const label = screen.getByTestId('testField-label');
    expect(label).toHaveClass('label required');
  });

  it('does not show required indicator when field is not required', () => {
    const field = createMockFormField({ required: false });
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    const label = screen.getByTestId('testField-label');
    expect(label).toHaveClass('label');
    expect(label).not.toHaveClass('required');
  });

  it('displays error message when field has errors', () => {
    const field = createMockFormField({
      errors: ['Value must be greater than 0', 'Must be a valid number'],
      errorCount: 2
    });
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    expect(screen.getByTestId('testField-error')).toBeInTheDocument();
    expect(screen.getByText('Value must be greater than 0')).toBeInTheDocument();
  });

  it('does not display error message when field has no errors', () => {
    const field = createMockFormField({ errors: [] });
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    expect(screen.queryByTestId('testField-error')).not.toBeInTheDocument();
  });

  it('shows dirty indicator when field is dirty', () => {
    const field = createMockFormField({ dirty: true });
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    expect(screen.getByTestId('testField-dirty-indicator')).toBeInTheDocument();
    expect(screen.getByText('Modified')).toBeInTheDocument();
  });

  it('does not show dirty indicator when field is not dirty', () => {
    const field = createMockFormField({ dirty: false });
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    expect(screen.queryByTestId('testField-dirty-indicator')).not.toBeInTheDocument();
  });

  it('disables input when field is read-only', () => {
    const field = createMockFormField({
      schema: { type: 'number', readOnly: true }
    });
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    const input = screen.getByTestId('testField') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('enables input when field is not read-only', () => {
    const field = createMockFormField({
      schema: { type: 'number', readOnly: false }
    });
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    const input = screen.getByTestId('testField') as HTMLInputElement;
    expect(input.disabled).toBe(false);
  });

  it('uses domContextId when provided', () => {
    const field = createMockFormField();
    
    render(<NumberField field={field} onChange={mockOnChange} domContextId="form1" />);
    
    expect(screen.getByTestId('form1.testField')).toBeInTheDocument();
    expect(screen.getByTestId('form1.testField-label')).toBeInTheDocument();
  });

  it('handles nested field paths correctly', () => {
    const field = createMockFormField({
      path: 'user.profile.age',
      schema: { type: 'number' }
    });
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    expect(screen.getByTestId('user.profile.age')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
  });

  it('handles complex scenarios with all features', () => {
    const field = createMockFormField({
      path: 'product.price',
      value: 29.99,
      pristineValue: 19.99,
      schema: {
        type: 'number',
        title: 'Product Price',
        description: 'Enter the price in USD',
        minimum: 0,
        readOnly: false
      },
      errors: ['Price must be greater than $10'],
      errorCount: 1,
      required: true,
      dirty: true,
      dirtyCount: 1,
      hasChanges: true,
      lastModified: new Date()
    });
    
    render(<NumberField field={field} onChange={mockOnChange} domContextId="productForm" />);
    
    // Check all elements are present
    const input = screen.getByTestId('productForm.product.price') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('29.99');
    expect(screen.getByText('Product Price')).toBeInTheDocument();
    expect(screen.getByText('Enter the price in USD')).toBeInTheDocument();
    expect(screen.getByText('Price must be greater than $10')).toBeInTheDocument();
    expect(screen.getByText('Modified')).toBeInTheDocument();
    
    const label = screen.getByTestId('productForm.product.price-label');
    expect(label).toHaveClass('label required');
  });

  it('handles interaction correctly', () => {
    const field = createMockFormField({ value: 10 });
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    const input = screen.getByTestId('testField');
    
    // Test typing
    fireEvent.change(input, { target: { value: '25' } });
    expect(mockOnChange).toHaveBeenCalledWith(25, false);
    
    // Test blur
    fireEvent.blur(input, { target: { value: '30' } });
    expect(mockOnChange).toHaveBeenCalledWith(30, true);
    
    expect(mockOnChange).toHaveBeenCalledTimes(2);
  });

  it('applies yellow background styling when field has changes', () => {
    const field = createMockFormField({ hasChanges: true });
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    const input = screen.getByTestId('testField') as HTMLInputElement;
    expect(input.style.backgroundColor).toBe('rgb(255, 243, 205)'); // #fff3cd in rgb
    expect(input.style.borderColor).toBe('rgb(255, 193, 7)'); // #ffc107 in rgb
  });

  it('does not apply yellow background styling when field has no changes', () => {
    const field = createMockFormField({ hasChanges: false });
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    const input = screen.getByTestId('testField') as HTMLInputElement;
    expect(input.style.backgroundColor).toBe('');
    expect(input.style.borderColor).toBe('');
  });

  it('handles NaN values gracefully', () => {
    const field = createMockFormField();
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    const input = screen.getByTestId('testField');
    fireEvent.change(input, { target: { value: 'not-a-number' } });
    
    // HTML number inputs convert invalid input to 0, not NaN
    expect(mockOnChange).toHaveBeenCalledWith(0, false);
  });

  it('handles empty string input', () => {
    const field = createMockFormField({ value: 42 });
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    const input = screen.getByTestId('testField');
    fireEvent.change(input, { target: { value: '' } });
    
    // Number('') returns 0
    expect(mockOnChange).toHaveBeenCalledWith(0, false);
  });

  it('handles large numbers correctly', () => {
    const field = createMockFormField({ value: 1000000 });
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    const input = screen.getByTestId('testField') as HTMLInputElement;
    expect(input.value).toBe('1000000');
    
    fireEvent.change(input, { target: { value: '9999999' } });
    expect(mockOnChange).toHaveBeenCalledWith(9999999, false);
  });

  it('handles scientific notation', () => {
    const field = createMockFormField();
    
    render(<NumberField field={field} onChange={mockOnChange} />);
    
    const input = screen.getByTestId('testField');
    fireEvent.change(input, { target: { value: '1e5' } });
    
    expect(mockOnChange).toHaveBeenCalledWith(100000, false);
  });
});
