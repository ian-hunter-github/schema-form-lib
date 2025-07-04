import React from 'react';
import type { JSONSchema } from '../../../types/schema';

interface DemoStringFieldProps {
  schema: JSONSchema;
  value?: string;
  onChange?: (value: string) => void;
}

export const DemoStringField: React.FC<DemoStringFieldProps> = ({ 
  schema, 
  value = '', 
  onChange 
}) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem' }}>
        {schema.title || 'Text Field'}
        {schema.required && <span style={{ color: 'red' }}>*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
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
