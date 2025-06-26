import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BooleanField from '../BooleanField';
import type { FormField } from '../../../../utils/formModel/types';
import type { JSONSchema } from '../../../../types/schema';

// Helper function to create a mock FormField
const createMockFormField = (overrides: Partial<FormField> = {}): FormField => {
  const defaultSchema: JSONSchema = {
    type: 'boolean',
    title: 'Test Field',
    description: 'A test boolean field',
  };

  return {
    path: 'testField',
    value: false,
    pristineValue: false,
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

describe('BooleanField', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with basic props', () => {
    const field = createMockFormField();
    
    render(<BooleanField field={field} onChange={mockOnChange} />);
    
    expect(screen.getByTestId('testField')).toBeInTheDocument();
    expect(screen.getByTestId('testField-label')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
  });

  it('displays the field value as checked/unchecked', () => {
    const field = createMockFormField({ value: true });
    
    render(<BooleanField field={field} onChange={mockOnChange} />);
    
    const checkbox = screen.getByTestId('testField') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('handles false value correctly', () => {
    const field = createMockFormField({ value: false });
    
    render(<BooleanField field={field} onChange={mockOnChange} />);
    
    const checkbox = screen.getByTestId('testField') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('handles null/undefined values gracefully', () => {
    const field = createMockFormField({ value: null });
    
    render(<BooleanField field={field} onChange={mockOnChange} />);
    
    const checkbox = screen.getByTestId('testField') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('calls onChange when checkbox is clicked', () => {
    const field = createMockFormField({ value: false });
    
    render(<BooleanField field={field} onChange={mockOnChange} />);
    
    const checkbox = screen.getByTestId('testField');
    fireEvent.click(checkbox);
    
    expect(mockOnChange).toHaveBeenCalledWith(true, false);
  });

  it('calls onChange with validation trigger on blur', () => {
    const field = createMockFormField({ value: false });
    
    render(<BooleanField field={field} onChange={mockOnChange} />);
    
    const checkbox = screen.getByTestId('testField');
    fireEvent.blur(checkbox);
    
    expect(mockOnChange).toHaveBeenCalledWith(false, true);
  });

  it('displays field title from schema', () => {
    const field = createMockFormField({
      schema: { type: 'boolean', title: 'Custom Title' }
    });
    
    render(<BooleanField field={field} onChange={mockOnChange} />);
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('falls back to field path when no title is provided', () => {
    const field = createMockFormField({
      path: 'user.isActive',
      schema: { type: 'boolean' }
    });
    
    render(<BooleanField field={field} onChange={mockOnChange} />);
    
    expect(screen.getByText('IsActive')).toBeInTheDocument();
  });

  it('displays description when provided', () => {
    const field = createMockFormField({
      schema: {
        type: 'boolean',
        description: 'Check this box to enable notifications'
      }
    });
    
    render(<BooleanField field={field} onChange={mockOnChange} />);
    
    expect(screen.getByTestId('testField-description')).toBeInTheDocument();
    expect(screen.getByText('Check this box to enable notifications')).toBeInTheDocument();
  });

  it('does not display description when not provided', () => {
    const field = createMockFormField({
      schema: { type: 'boolean' }
    });
    
    render(<BooleanField field={field} onChange={mockOnChange} />);
    
    expect(screen.queryByTestId('testField-description')).not.toBeInTheDocument();
  });

  it('shows required indicator when field is required', () => {
    const field = createMockFormField({ required: true });
    
    render(<BooleanField field={field} onChange={mockOnChange} />);
    
    const label = screen.getByTestId('testField-label');
    expect(label).toHaveClass('label required');
  });

  it('does not show required indicator when field is not required', () => {
    const field = createMockFormField({ required: false });
    
    render(<BooleanField field={field} onChange={mockOnChange} />);
    
    const label = screen.getByTestId('testField-label');
    expect(label).toHaveClass('label');
    expect(label).not.toHaveClass('required');
  });

  it('displays error message when field has errors', () => {
    const field = createMockFormField({
      errors: ['This field is required', 'Must be checked'],
      errorCount: 2
    });
    
    render(<BooleanField field={field} onChange={mockOnChange} />);
    
    expect(screen.getByTestId('testField-error')).toBeInTheDocument();
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('does not display error message when field has no errors', () => {
    const field = createMockFormField({ errors: [] });
    
    render(<BooleanField field={field} onChange={mockOnChange} />);
    
    expect(screen.queryByTestId('testField-error')).not.toBeInTheDocument();
  });

  it('shows dirty indicator when field is dirty', () => {
    const field = createMockFormField({ dirty: true });
    
    render(<BooleanField field={field} onChange={mockOnChange} />);
    
    expect(screen.getByTestId('testField-dirty-indicator')).toBeInTheDocument();
    expect(screen.getByText('Modified')).toBeInTheDocument();
  });

  it('does not show dirty indicator when field is not dirty', () => {
    const field = createMockFormField({ dirty: false });
    
    render(<BooleanField field={field} onChange={mockOnChange} />);
    
    expect(screen.queryByTestId('testField-dirty-indicator')).not.toBeInTheDocument();
  });

  it('disables checkbox when field is read-only', () => {
    const field = createMockFormField({
      schema: { type: 'boolean', readOnly: true }
    });
    
    render(<BooleanField field={field} onChange={mockOnChange} />);
    
    const checkbox = screen.getByTestId('testField') as HTMLInputElement;
    expect(checkbox.disabled).toBe(true);
  });

  it('enables checkbox when field is not read-only', () => {
    const field = createMockFormField({
      schema: { type: 'boolean', readOnly: false }
    });
    
    render(<BooleanField field={field} onChange={mockOnChange} />);
    
    const checkbox = screen.getByTestId('testField') as HTMLInputElement;
    expect(checkbox.disabled).toBe(false);
  });


  it('handles nested field paths correctly', () => {
    const field = createMockFormField({
      path: 'user.preferences.notifications',
      schema: { type: 'boolean' }
    });
    
    render(<BooleanField field={field} onChange={mockOnChange} />);
    
    expect(screen.getByTestId('user.preferences.notifications')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('handles complex scenarios with all features', () => {
    const field = createMockFormField({
      path: 'user.isActive',
      value: true,
      pristineValue: false,
      schema: {
        type: 'boolean',
        title: 'Active Status',
        description: 'Check to activate user account',
        readOnly: false
      },
      errors: ['Account must be verified first'],
      errorCount: 1,
      required: true,
      dirty: true,
      dirtyCount: 1,
      hasChanges: true,
      lastModified: new Date()
    });
    
    render(<BooleanField field={field} onChange={mockOnChange} />);
    
    // Check all elements are present
    const checkbox = screen.getByTestId('user.isActive') as HTMLInputElement;
    expect(checkbox).toBeInTheDocument();
    expect(checkbox.checked).toBe(true);
    expect(screen.getByText('Active Status')).toBeInTheDocument();
    expect(screen.getByText('Check to activate user account')).toBeInTheDocument();
    expect(screen.getByText('Account must be verified first')).toBeInTheDocument();
    expect(screen.getByText('Modified')).toBeInTheDocument();
    
    const label = screen.getByTestId('user.isActive-label');
    expect(label).toHaveClass('label required');
  });

  it('handles interaction correctly', () => {
    const field = createMockFormField({ value: false });
    
    render(<BooleanField field={field} onChange={mockOnChange} />);
    
    const checkbox = screen.getByTestId('testField');
    
    // Test clicking to check
    fireEvent.click(checkbox);
    expect(mockOnChange).toHaveBeenCalledWith(true, false);
    
    // Test blur
    fireEvent.blur(checkbox);
    expect(mockOnChange).toHaveBeenCalledWith(false, true);
    
    expect(mockOnChange).toHaveBeenCalledTimes(2);
  });

  it('applies yellow background styling when field has changes', () => {
    const field = createMockFormField({ hasChanges: true });
    
    render(<BooleanField field={field} onChange={mockOnChange} />);
    
    const checkbox = screen.getByTestId('testField') as HTMLInputElement;
    expect(checkbox.style.backgroundColor).toBe('rgb(255, 243, 205)'); // #fff3cd in rgb
    expect(checkbox.style.borderColor).toBe('rgb(255, 193, 7)'); // #ffc107 in rgb
  });

  it('does not apply yellow background styling when field has no changes', () => {
    const field = createMockFormField({ hasChanges: false });
    
    render(<BooleanField field={field} onChange={mockOnChange} />);
    
    const checkbox = screen.getByTestId('testField') as HTMLInputElement;
    expect(checkbox.style.backgroundColor).toBe('');
    expect(checkbox.style.borderColor).toBe('');
  });

  it('toggles value correctly on multiple clicks', () => {
    const field = createMockFormField({ value: false });
    
    const { rerender } = render(<BooleanField field={field} onChange={mockOnChange} />);
    
    const checkbox = screen.getByTestId('testField') as HTMLInputElement;
    
    // First click - should check
    fireEvent.click(checkbox);
    expect(mockOnChange).toHaveBeenCalledWith(true, false);
    
    // Simulate the field value changing for the second click
    mockOnChange.mockClear();
    const updatedField = createMockFormField({ value: true });
    rerender(<BooleanField field={updatedField} onChange={mockOnChange} />);
    
    const updatedCheckbox = screen.getByTestId('testField') as HTMLInputElement;
    
    // Second click - should uncheck
    fireEvent.click(updatedCheckbox);
    expect(mockOnChange).toHaveBeenCalledWith(false, false);
    
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });
});
