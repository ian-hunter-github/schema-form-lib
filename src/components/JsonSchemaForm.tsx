import React, { useState } from 'react';
import type { JSONSchemaProperties, JSONValue, FormValue } from '../types/schema';
import FieldRenderer from './FieldRenderer';

type Props = {
  schema: JSONSchemaProperties;
  onSubmit?: (data: Record<string, JSONValue>) => void;
};

const JsonSchemaForm: React.FC<Props> = ({ schema, onSubmit }) => {
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


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    let hasErrors = false;
    
    Object.keys(schema).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) {
        newErrors[key] = err;
        hasErrors = true;
      }
    });
    
    setErrors(newErrors);
    
    if (!hasErrors && onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <form data-testid="form" onSubmit={handleSubmit}>
      {Object.keys(schema).map(key => (
        <div key={key}>
          <FieldRenderer
            name={key}
            value={formData[key]}
            schema={schema[key]}
            onChange={(value) => handleChange(key, value)}
            error={errors[key]}
          />
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
};

export default JsonSchemaForm;
