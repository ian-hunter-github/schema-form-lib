import React from 'react';
import type { JSONSchema } from '../../../types/schema';

interface DemoNumberFieldProps {
  schema: JSONSchema;
  value?: number;
  onChange?: (value: number) => void;
}

export const DemoNumberField: React.FC<DemoNumberFieldProps> = ({ 
  schema, 
  value = 0, 
  onChange 
}) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem' }}>
        {schema.title || 'Number Field'}
        {schema.required && <span style={{ color: 'red' }}>*</span>}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange?.(parseFloat(e.target.value))}
        style={{ width: '100%', padding: '0.5rem' }}
      />
      {schema.description && (
        <small style={{ display: 'block', marginTop: '0.25rem' }}>
          {schema.description}
        </small>
      )}
    </div>
  );
};
