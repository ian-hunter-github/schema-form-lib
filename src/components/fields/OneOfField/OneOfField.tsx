import React, { memo, useState } from 'react';
import SchemaRenderer from '../../SchemaRenderer';
import type { JSONSchema } from '../../../types/schema';
import './OneOfField.css';

interface OneOfFieldProps {
  schema: JSONSchema;
  path: string;
  onChange?: (path: string, value: unknown) => void;
}

export const OneOfField: React.FC<OneOfFieldProps> = ({ 
  schema, 
  path, 
  onChange 
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!schema.oneOf || !Array.isArray(schema.oneOf)) {
    return null;
  }

  const handleOptionChange = (index: number) => {
    setSelectedIndex(index);
    // Reset value when switching options
    onChange?.(path, undefined);
  };

  const selectedSchema = schema.oneOf[selectedIndex];

  return (
    <div className="one-of-field">
      <div className="one-of-selector">
        {schema.oneOf.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionChange(index)}
            className={selectedIndex === index ? 'active' : ''}
          >
            {option.title || `Option ${index + 1}`}
          </button>
        ))}
      </div>

      {selectedSchema && (
        <SchemaRenderer
          schema={selectedSchema}
          path={path}
          onChange={(val) => onChange?.(path, val)}
        />
      )}
    </div>
  );
};

const areEqual = (prevProps: OneOfFieldProps, nextProps: OneOfFieldProps) => {
  return (
    prevProps.schema === nextProps.schema &&
    prevProps.path === nextProps.path
  );
};

// Export both named and memoized default versions
export default memo(OneOfField, areEqual);
