import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { toBeInTheDocument, toHaveValue, toBeChecked, toBeDisabled, toHaveTextContent } from '@testing-library/jest-dom/matchers';
import JsonSchemaForm from '../components/JsonSchemaForm';
import type { JSONSchemaProperties } from '../components/JsonSchemaForm';

expect.extend({
  toBeInTheDocument,
  toHaveValue,
  toBeChecked,
  toBeDisabled,
  toHaveTextContent
});

describe('JsonSchemaForm Flat Features (with data-testid)', () => {
  const baseSchema = {
    type: 'object',
    required: ['name', 'age'],
    properties: {
      name: { type: 'string', description: 'Full Name', minLength: 3, maxLength: 10 },
      age: { type: 'number', minimum: 18, maximum: 99, default: 30 },
      isStudent: { type: 'boolean', default: true },
      gender: { type: 'string', enum: ['Male', 'Female'] },
      id: { type: 'string', readOnly: true, default: 'ABC123' },
      tags: { type: 'array', items: { type: 'string' } }
    } as JSONSchemaProperties
  };

  it('renders all field types with correct data-testids', () => {
    render(<JsonSchemaForm schema={baseSchema.properties} />);
    
    expect(screen.getByTestId('name')).toBeInTheDocument();
    expect(screen.getByTestId('age')).toBeInTheDocument();
    expect(screen.getByTestId('isStudent')).toBeInTheDocument();
    expect(screen.getByTestId('gender')).toBeInTheDocument();
    expect(screen.getByTestId('id')).toBeDisabled();
    expect(screen.getByTestId('tags-0')).toBeInTheDocument();
  });

  it('applies default values correctly', () => {
    render(<JsonSchemaForm schema={baseSchema.properties} />);
    
    expect(screen.getByTestId('age')).toHaveValue(30);
    expect(screen.getByTestId('isStudent')).toBeChecked();
    expect(screen.getByTestId('id')).toHaveValue('ABC123');
  });

  it('validates required fields on submit', async () => {
    render(<JsonSchemaForm schema={baseSchema.properties} />);
    
    fireEvent.submit(screen.getByTestId('form'));

    expect(await screen.findAllByTestId(/error-/)).toHaveLength(2); // 'name' and 'age'
  });

  it('validates minLength, maxLength, min, max constraints', async () => {
    render(<JsonSchemaForm schema={baseSchema.properties} />);
    
    // minLength
    const nameInput = screen.getByTestId('name');
    fireEvent.change(nameInput, { target: { value: 'Al' } });
    fireEvent.blur(nameInput);
    expect(await screen.findByTestId('error-name')).toBeInTheDocument();
    
    // maxLength
    fireEvent.change(nameInput, { target: { value: 'VeryLongNameHere' } });
    fireEvent.blur(nameInput);
    expect(await screen.findByTestId('error-name')).toBeInTheDocument();
    
    // min number
    const ageInput = screen.getByTestId('age');
    fireEvent.change(ageInput, { target: { value: '10' } });
    fireEvent.blur(ageInput);
    expect(await screen.findByTestId('error-age')).toBeInTheDocument();
    
    // max number
    fireEvent.change(ageInput, { target: { value: '150' } });
    fireEvent.blur(ageInput);
    expect(await screen.findByTestId('error-age')).toBeInTheDocument();
  });

  it('displays help text / description', () => {
    render(<JsonSchemaForm schema={baseSchema.properties} />);
    expect(screen.getByTestId('description-name')).toHaveTextContent('Full Name');
  });

  it('handles readonly/disabled fields', () => {
    render(<JsonSchemaForm schema={baseSchema.properties} />);
    const idInput = screen.getByTestId('id');
    expect(idInput).toBeDisabled();
    expect(idInput).toHaveValue('ABC123');
  });

  it('renders enum field with placeholder', () => {
    render(<JsonSchemaForm schema={baseSchema.properties} />);
    const genderSelect = screen.getByTestId('gender');
    expect(genderSelect).toBeInTheDocument();
    expect(genderSelect).toHaveValue('');
  });

  it('sets and gets values correctly', async () => {
    render(<JsonSchemaForm schema={baseSchema.properties} />);

    const nameInput = screen.getByTestId('name');
    const ageInput = screen.getByTestId('age');
    const checkbox = screen.getByTestId('isStudent');
    const genderSelect = screen.getByTestId('gender');

    fireEvent.change(nameInput, { target: { value: 'Alice' } });
    fireEvent.change(ageInput, { target: { value: '25' } });
    fireEvent.click(checkbox); // toggle off
    fireEvent.change(genderSelect, { target: { value: 'Female' } });

    expect(nameInput).toHaveValue('Alice');
    expect(ageInput).toHaveValue(25);
    expect(checkbox).not.toBeChecked();
    expect(genderSelect).toHaveValue('Female');
  });

  it('handles adding and removing items in primitive array', async () => {
    render(<JsonSchemaForm schema={baseSchema.properties} />);

    const addButton = screen.getByTestId('add-tags');
    fireEvent.click(addButton); // tags-1 created
    fireEvent.click(addButton); // tags-2 created

    // Set values for each array item
    const tag0 = screen.getByTestId('tags-0');
    const tag1 = screen.getByTestId('tags-1');
    const tag2 = screen.getByTestId('tags-2');
    fireEvent.change(tag0, { target: { value: 'first' } });
    fireEvent.change(tag1, { target: { value: 'second' } });
    fireEvent.change(tag2, { target: { value: 'third' } });

    // Verify initial values
    expect(tag0).toHaveValue('first');
    expect(tag1).toHaveValue('second');
    expect(tag2).toHaveValue('third');

    // Remove middle item
    const removeButton = screen.getByTestId('tags-1-remove');
    fireEvent.click(removeButton);

    // Verify remaining items maintain their values and positions
    expect(screen.getByTestId('tags-0')).toHaveValue('first');
    expect(screen.getByTestId('tags-1')).toHaveValue('third');

  });
});
