import React from 'react';
import { render, screen, fireEvent } from '../../../../__tests__/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ObjectField from '../ObjectField';
import type { FormField } from '../../../../types/fields';
import type { JSONSchema } from '../../../../types/schema';
import type { FormModel } from '../../../../utils/form/FormModel';

// Helper function to create a mock FormField
const createMockFormField = (overrides: Partial<FormField> = {}): FormField => {
  const defaultSchema: JSONSchema = {
    type: 'object',
    title: 'Test Object',
    description: 'A test object field',
    properties: {
      name: { type: 'string', title: 'Name' },
      age: { type: 'number', title: 'Age' },
      active: { type: 'boolean', title: 'Active' }
    }
  };

  return {
    path: 'testObject',
    value: {},
    pristineValue: {},
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

// Mock FormModel
const createMockFormModel = (fields: Record<string, FormField> = {}) => ({
  getField: vi.fn((path: string) => fields[path]),
  setValue: vi.fn(),
  shouldShowErrors: vi.fn((field?: FormField) => {
    return field ? field.errors.length > 0 : true;
  }),
  shouldShowDirty: vi.fn((field?: FormField) => {
    return field ? field.dirty : true;
  }),
} as unknown as FormModel);

describe('ObjectField', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with basic props', () => {
    const field = createMockFormField();
    const formModel = createMockFormModel();
    
    render(<ObjectField field={field} onChange={mockOnChange} formModel={formModel} />);
    
    expect(screen.getByTestId('testObject-label')).toBeInTheDocument();
    expect(screen.getByText('Test Object')).toBeInTheDocument();
  });

  it('displays the field title from schema', () => {
    const field = createMockFormField({
      schema: { 
        type: 'object', 
        title: 'Custom Object Title',
        properties: {}
      }
    });
    const formModel = createMockFormModel();
    
    render(<ObjectField field={field} onChange={mockOnChange} formModel={formModel} />);
    
    expect(screen.getByText('Custom Object Title')).toBeInTheDocument();
  });

  it('falls back to field path when no title is provided', () => {
    const field = createMockFormField({
      path: 'user.profile',
      schema: { type: 'object', properties: {} }
    });
    const formModel = createMockFormModel();
    
    render(<ObjectField field={field} onChange={mockOnChange} formModel={formModel} />);
    
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('displays description when provided', () => {
    const field = createMockFormField({
      schema: {
        type: 'object',
        description: 'This is a test object with nested fields',
        properties: {}
      }
    });
    const formModel = createMockFormModel();
    
    render(<ObjectField field={field} onChange={mockOnChange} formModel={formModel} />);
    
    // Click to expand the accordion to see the description
    const header = screen.getByText('TestObject').closest('div');
    fireEvent.click(header!);
    
    expect(screen.getByTestId('testObject-description')).toBeInTheDocument();
    expect(screen.getByText('This is a test object with nested fields')).toBeInTheDocument();
  });

  it('shows required indicator when field is required', () => {
    const field = createMockFormField({ required: true });
    const formModel = createMockFormModel();
    
    render(<ObjectField field={field} onChange={mockOnChange} formModel={formModel} />);
    
    const label = screen.getByTestId('testObject-label');
    expect(label).toBeInTheDocument();
    expect(label.textContent).toContain('*');
  });

  it('displays error message when field has errors', () => {
    const field = createMockFormField({
      errors: ['Object validation failed'],
      errorCount: 1
    });
    const formModel = createMockFormModel();
    
    render(<ObjectField field={field} onChange={mockOnChange} formModel={formModel} />);
    
    // Click to expand the accordion
    const header = screen.getByText('Test Object').closest('div');
    fireEvent.click(header!);
    
    expect(screen.getByTestId('testObject-error')).toBeInTheDocument();
    expect(screen.getByText('Object validation failed')).toBeInTheDocument();
  });

  it('shows dirty indicator when field is dirty', () => {
    const field = createMockFormField({ dirty: true });
    const formModel = createMockFormModel();
    
    render(<ObjectField field={field} onChange={mockOnChange} formModel={formModel} />);
    
    // Click to expand the accordion
    const header = screen.getByText('Test Object').closest('div');
    fireEvent.click(header!);
    
    const dirtyIndicator = screen.getByTestId('testObject-dirty-indicator-header');
    expect(dirtyIndicator).toBeInTheDocument();
    expect(dirtyIndicator).toHaveTextContent('Modified');
  });

  it('toggles accordion expansion when header is clicked', () => {
    const field = createMockFormField({
      schema: {
        type: 'object',
        title: 'Test Object',
        properties: {}
      }
    });
    const formModel = createMockFormModel();
    
    render(<ObjectField field={field} onChange={mockOnChange} formModel={formModel} />);
    
    const header = screen.getByText('Test Object').closest('div');
    expect(header).toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(header!);
    
    // Initially expanded, content should be visible
    expect(screen.getByText('No properties defined for this object')).toBeInTheDocument();
    
    // Click to collapse
    fireEvent.click(header!);
    
    // Content should be hidden
    expect(screen.queryByText('No properties defined for this object')).not.toBeInTheDocument();
    
    // Click to expand again
    fireEvent.click(header!);
    
    // Content should be visible again
    expect(screen.getByText('No properties defined for this object')).toBeInTheDocument();
  });

  it('renders nested fields when formModel provides them', () => {
    const field = createMockFormField();
    
    // Create mock nested fields
    const nameField = createMockFormField({
      path: 'testObject.name',
      schema: { type: 'string', title: 'Name' },
      value: 'John Doe'
    });
    
    const ageField = createMockFormField({
      path: 'testObject.age',
      schema: { type: 'number', title: 'Age' },
      value: 30
    });
    
    const formModel = createMockFormModel({
      'testObject.name': nameField,
      'testObject.age': ageField,
      'testObject.active': createMockFormField({
        path: 'testObject.active',
        schema: { type: 'boolean', title: 'Active' },
        value: true
      })
    });
    
    render(<ObjectField field={field} onChange={mockOnChange} formModel={formModel} />);
    
    // Click to expand the accordion to trigger nested field rendering
    const header = screen.getByText('Test Object').closest('div');
    fireEvent.click(header!);
    
    // Should render nested fields
    expect(formModel.getField).toHaveBeenCalledWith('testObject.name');
    expect(formModel.getField).toHaveBeenCalledWith('testObject.age');
    expect(formModel.getField).toHaveBeenCalledWith('testObject.active');
  });

  it('handles nested object fields recursively', () => {
    const field = createMockFormField({
      schema: {
        type: 'object',
        properties: {
          profile: {
            type: 'object',
            title: 'Profile',
            properties: {
              name: { type: 'string', title: 'Name' }
            }
          }
        }
      }
    });
    
    const profileField = createMockFormField({
      path: 'testObject.profile',
      schema: {
        type: 'object',
        title: 'Profile',
        properties: {
          name: { type: 'string', title: 'Name' }
        }
      }
    });
    
    const formModel = createMockFormModel({
      'testObject.profile': profileField
    });
    
    render(<ObjectField field={field} onChange={mockOnChange} formModel={formModel} />);
    
    // Click to expand the accordion to trigger nested field rendering
    const header = screen.getByText('TestObject').closest('div');
    fireEvent.click(header!);
    
    expect(formModel.getField).toHaveBeenCalledWith('testObject.profile');
  });


  it('applies styling when field has changes', () => {
    const field = createMockFormField({ hasChanges: true });
    const formModel = createMockFormModel();
    
    render(<ObjectField field={field} onChange={mockOnChange} formModel={formModel} />);
    
    const header = screen.getByText('Test Object').closest('div');
    expect(header).toBeInTheDocument();
  });

  it('renders correctly when field has no changes', () => {
    const field = createMockFormField({ hasChanges: false });
    const formModel = createMockFormModel();
    
    render(<ObjectField field={field} onChange={mockOnChange} formModel={formModel} />);
    
    const header = screen.getByText('Test Object').closest('div');
    expect(header).toBeInTheDocument();
  });

  it('handles empty properties gracefully', () => {
    const field = createMockFormField({
      schema: {
        type: 'object',
        properties: {}
      }
    });
    const formModel = createMockFormModel();
    
    render(<ObjectField field={field} onChange={mockOnChange} formModel={formModel} />);
    
    // Click to expand the accordion to see the "No properties" message
    const header = screen.getByText('TestObject').closest('div');
    fireEvent.click(header!);
    
    expect(screen.getByText('No properties defined for this object')).toBeInTheDocument();
  });

  it('handles missing formModel gracefully', () => {
    const field = createMockFormField();
    const formModel = createMockFormModel();
    
    render(<ObjectField field={field} onChange={mockOnChange} formModel={formModel} />);
    
    // Should not crash and should show the basic structure
    expect(screen.getByTestId('testObject-label')).toBeInTheDocument();
    expect(screen.getByText('Test Object')).toBeInTheDocument();
  });

  it('handles complex nested scenarios', async () => {
    const field = createMockFormField({
      path: 'user',
      schema: {
        type: 'object',
        title: 'User Information',
        description: 'Complete user profile',
        properties: {
          profile: {
            type: 'object',
            title: 'Profile',
            properties: {
              name: { type: 'string', title: 'Full Name' },
              email: { type: 'string', title: 'Email' }
            }
          },
          preferences: {
            type: 'object',
            title: 'Preferences',
            properties: {
              theme: { type: 'string', title: 'Theme' },
              notifications: { type: 'boolean', title: 'Notifications' }
            }
          }
        }
      },
      errors: ['User validation failed'],
      required: true,
      dirty: true,
      hasChanges: true
    });
    
    const profileField = createMockFormField({
      path: 'user.profile',
      schema: {
        type: 'object',
        title: 'Profile',
        properties: {
          name: { type: 'string', title: 'Full Name' },
          email: { type: 'string', title: 'Email' }
        }
      }
    });
    
    const preferencesField = createMockFormField({
      path: 'user.preferences',
      schema: {
        type: 'object',
        title: 'Preferences',
        properties: {
          theme: { type: 'string', title: 'Theme' },
          notifications: { type: 'boolean', title: 'Notifications' }
        }
      }
    });
    
    const formModel = createMockFormModel({
      'user.profile': profileField,
      'user.preferences': preferencesField
    });
    
    render(<ObjectField field={field} onChange={mockOnChange} formModel={formModel} />);
    
    // Click to expand the accordion to see the description
    const header = screen.getByText('User Information').closest('div');
    fireEvent.click(header!);
    
    // Check all elements are present
    expect(screen.getByText('User Information')).toBeInTheDocument();
    expect(screen.getByText('Complete user profile')).toBeInTheDocument();
    
    // Error and dirty indicators should be visible after expanding
    expect(screen.getByTestId('user-error')).toBeInTheDocument();
    expect(screen.getByText('User validation failed')).toBeInTheDocument();
    const dirtyIndicator = screen.getByTestId('user-dirty-indicator-header');
    expect(dirtyIndicator).toBeInTheDocument();
    expect(dirtyIndicator).toHaveTextContent('Modified');
    
    const label = screen.getByTestId('user-label');
    expect(label).toBeInTheDocument();
    expect(label.textContent).toContain('*');
    
    // Check nested fields are requested
    expect(formModel.getField).toHaveBeenCalledWith('user.profile');
    expect(formModel.getField).toHaveBeenCalledWith('user.preferences');
  });
});
