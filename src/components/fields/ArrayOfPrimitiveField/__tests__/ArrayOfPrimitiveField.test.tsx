import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ArrayOfPrimitiveField from '../ArrayOfPrimitiveField';
import type { FormField } from '../../../../utils/formModel/types';
import type { JSONSchema } from '../../../../types/schema';
import type { FormModel } from '../../../../utils/formModel/FormModel';

// Helper function to create a mock FormField
const createMockFormField = (overrides: Partial<FormField> = {}): FormField => {
  const defaultSchema: JSONSchema = {
    type: 'array',
    title: 'Test Field',
    description: 'A test array field',
    items: { type: 'string' },
  };

  return {
    path: 'testField',
    value: [],
    pristineValue: [],
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

describe('ArrayOfPrimitiveField', () => {
  const mockOnChange = vi.fn();
  const mockFormModel = {
    addValue: vi.fn(),
    deleteValue: vi.fn(),
    setValue: vi.fn(),
    validate: vi.fn(),
  } as unknown as FormModel;

  beforeEach(() => {
    mockOnChange.mockClear();
    vi.clearAllMocks();
  });

  it('renders with basic props', () => {
    const field = createMockFormField();
    
    render(<ArrayOfPrimitiveField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.getByTestId('testField')).toBeInTheDocument();
    expect(screen.getByTestId('testField-label')).toBeInTheDocument();
    expect(screen.getByTestId('testField-add')).toBeInTheDocument();
  });

  it('displays field title from schema', () => {
    const field = createMockFormField({
      schema: { type: 'array', title: 'Custom Title', items: { type: 'string' } }
    });
    
    render(<ArrayOfPrimitiveField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('displays existing array items', () => {
    const field = createMockFormField({
      value: ['item1', 'item2', 'item3']
    });
    
    render(<ArrayOfPrimitiveField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.getByTestId('testField.0')).toBeInTheDocument();
    expect(screen.getByTestId('testField.1')).toBeInTheDocument();
    expect(screen.getByTestId('testField.2')).toBeInTheDocument();
    
    expect((screen.getByTestId('testField.0') as HTMLInputElement).value).toBe('item1');
    expect((screen.getByTestId('testField.1') as HTMLInputElement).value).toBe('item2');
    expect((screen.getByTestId('testField.2') as HTMLInputElement).value).toBe('item3');
  });

  it('adds new item when add button is clicked', () => {
    const field = createMockFormField();
    
    render(<ArrayOfPrimitiveField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const addButton = screen.getByTestId('testField-add');
    fireEvent.click(addButton);
    
    expect(mockFormModel.addValue).toHaveBeenCalledWith('testField', '');
  });

  it('removes item when remove button is clicked', () => {
    const field = createMockFormField({
      value: ['item1', 'item2']
    });
    
    render(<ArrayOfPrimitiveField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const removeButton = screen.getByTestId('testField.0-remove');
    fireEvent.click(removeButton);
    
    expect(mockFormModel.deleteValue).toHaveBeenCalledWith('testField.0');
  });

  it('updates item value when input changes', () => {
    const field = createMockFormField({
      value: ['item1']
    });
    
    render(<ArrayOfPrimitiveField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const input = screen.getByTestId('testField.0');
    fireEvent.change(input, { target: { value: 'updated item' } });
    
    expect(mockFormModel.setValue).toHaveBeenCalledWith('testField.0', 'updated item');
  });

  it('triggers validation on blur', () => {
    const field = createMockFormField({
      value: ['item1']
    });
    
    render(<ArrayOfPrimitiveField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const input = screen.getByTestId('testField.0');
    fireEvent.blur(input, { target: { value: 'blurred item' } });
    
    expect(mockFormModel.setValue).toHaveBeenCalledWith('testField.0', 'blurred item');
    expect(mockFormModel.validate).toHaveBeenCalled();
  });

  it('shows required indicator when field is required', () => {
    const field = createMockFormField({ required: true });
    
    render(<ArrayOfPrimitiveField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const label = screen.getByTestId('testField-label');
    expect(label).toHaveClass('label required');
  });

  it('displays error message when field has errors', () => {
    const field = createMockFormField({
      errors: ['Array must have at least one item'],
      errorCount: 1
    });
    
    render(<ArrayOfPrimitiveField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.getByTestId('testField-error')).toBeInTheDocument();
    expect(screen.getByText('Array must have at least one item')).toBeInTheDocument();
  });

  it('shows dirty indicator when field is dirty', () => {
    const field = createMockFormField({ dirty: true });
    
    render(<ArrayOfPrimitiveField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.getByTestId('testField-dirty-indicator')).toBeInTheDocument();
    expect(screen.getByText('Modified')).toBeInTheDocument();
  });

  it('disables inputs and buttons when read-only', () => {
    const field = createMockFormField({
      value: ['item1'],
      schema: { type: 'array', readOnly: true, items: { type: 'string' } }
    });
    
    render(<ArrayOfPrimitiveField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    const input = screen.getByTestId('testField.0') as HTMLInputElement;
    const addButton = screen.getByTestId('testField-add') as HTMLButtonElement;
    const removeButton = screen.getByTestId('testField.0-remove') as HTMLButtonElement;
    
    expect(input.disabled).toBe(true);
    expect(addButton.disabled).toBe(true);
    expect(removeButton.disabled).toBe(true);
  });


  it('handles empty array gracefully', () => {
    const field = createMockFormField({ value: [] });
    
    render(<ArrayOfPrimitiveField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.getByTestId('testField-add')).toBeInTheDocument();
    expect(screen.queryByTestId('testField.0')).not.toBeInTheDocument();
  });

  it('handles null/undefined values gracefully', () => {
    const field = createMockFormField({ value: null });
    
    render(<ArrayOfPrimitiveField field={field} onChange={mockOnChange} formModel={mockFormModel} />);
    
    expect(screen.getByTestId('testField-add')).toBeInTheDocument();
    expect(screen.queryByTestId('testField.0')).not.toBeInTheDocument();
  });
});
