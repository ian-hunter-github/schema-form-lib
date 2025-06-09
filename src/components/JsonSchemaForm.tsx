import React, { useState } from 'react';

type JSONValue = string | number | boolean | string[];
type FormValue = string | number | boolean | string[];

type JSONSchema = {
  type: 'string' | 'number' | 'boolean' | 'array';
  description?: string;
  enum?: string[];
  default?: FormValue;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  readOnly?: boolean;
  items?: JSONSchema;
};

export type JSONSchemaProperties = {
  [key: string]: JSONSchema;
};

type Props = {
  schema: JSONSchemaProperties;
};

const JsonSchemaForm: React.FC<Props> = ({ schema }) => {
  const initialState = Object.keys(schema).reduce((acc, key) => {
    const def = schema[key].default;
    if (schema[key].type === 'array') {
      acc[key] = def ?? [''];
    } else {
      acc[key] = def ?? (schema[key].type === 'boolean' ? false : '');
    }
    return acc;
  }, {} as Record<string, JSONValue>);

  const [formData, setFormData] = useState<Record<string, JSONValue>>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (key: string, value: FormValue): string => {
    const field = schema[key];

    if (field.readOnly) return '';

    if (value === '' || value === undefined) {
      return 'This field is required.';
    }

    if (field.type === 'string' && typeof value === 'string') {
      if (field.minLength && value.length < field.minLength) return `Must be at least ${field.minLength} characters.`;
      if (field.maxLength && value.length > field.maxLength) return `Must be no more than ${field.maxLength} characters.`;
    }

    if (field.type === 'number') {
      const num = Number(value);
      if (isNaN(num)) return 'Must be a number.';
      if (field.minimum !== undefined && num < field.minimum) return `Must be at least ${field.minimum}.`;
      if (field.maximum !== undefined && num > field.maximum) return `Must be no more than ${field.maximum}.`;
    }

    return '';
  };

  const handleChange = (key: string, value: FormValue) => {
    const error = validateField(key, value);
    setErrors(prev => ({ ...prev, [key]: error }));
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleArrayChange = (key: string, index: number, value: string) => {
    const current = formData[key];
    if (!Array.isArray(current)) return;
    const arr = [...current];
    arr[index] = value;
    setFormData(prev => ({ ...prev, [key]: arr }));
  };

  const addArrayItem = (key: string) => {
    const current = formData[key];
    if (!Array.isArray(current)) return;
    setFormData(prev => ({ ...prev, [key]: [...current, ''] }));
  };

  const removeArrayItem = (key: string, index: number) => {
    const current = formData[key];
    if (!Array.isArray(current)) return;
    const arr = [...current];
    arr.splice(index, 1);
    setFormData(prev => ({ ...prev, [key]: arr }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    Object.keys(schema).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
  };

  return (
    <form data-testid="form" onSubmit={handleSubmit}>
      {Object.keys(schema).map(key => {
        const field = schema[key];
        const value = formData[key];

        return (
          <div key={key}>
            {field.description && (
              <div data-testid={`description-${key}`}>{field.description}</div>
            )}

            {field.type === 'string' && !field.enum && (
              <input
                data-testid={key}
                type="text"
                value={value as string}
                disabled={field.readOnly}
                onChange={e => handleChange(key, e.target.value)}
              />
            )}

            {field.type === 'number' && (
              <input
                data-testid={key}
                type="number"
                value={value as number}
                disabled={field.readOnly}
                onChange={e => handleChange(key, Number(e.target.value))}
              />
            )}

            {field.type === 'boolean' && (
              <input
                data-testid={key}
                type="checkbox"
                checked={value as boolean}
                disabled={field.readOnly}
                onChange={e => handleChange(key, e.target.checked)}
              />
            )}

            {field.enum && (
              <select
                data-testid={key}
                value={value as string}
                onChange={e => handleChange(key, e.target.value)}
              >
                <option value="">Select...</option>
                {field.enum.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            )}

            {field.type === 'array' && field.items?.type === 'string' && (
              <div>
                {(value as string[]).map((item: string, index: number) => (
                  <div key={`${key}-${index}`}>
                    <input
                      data-testid={`${key}-${index}`}
                      type="text"
                      value={item}
                      onChange={e => handleArrayChange(key, index, e.target.value)}
                    />
                    <button
                      type="button"
                      data-testid={`${key}-${index}-remove`}
                      onClick={() => removeArrayItem(key, index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  data-testid={`add-${key}`}
                  onClick={() => addArrayItem(key)}
                >
                  Add
                </button>
              </div>
            )}

            {errors[key] && (
              <div data-testid={`error-${key}`} style={{ color: 'red' }}>
                {errors[key]}
              </div>
            )}
          </div>
        );
      })}
      <button type="submit">Submit</button>
    </form>
  );
};

export default JsonSchemaForm;
