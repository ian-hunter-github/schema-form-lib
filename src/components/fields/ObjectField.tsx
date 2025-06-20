import React, { useState } from 'react';
import type { FieldProps, FormValue } from '../../types/schema';
import FieldRenderer from '../FieldRenderer';
import { capitalizeFirstLetter } from '../../utils/StringUtils';

const ObjectField: React.FC<FieldProps & { depth?: number }> = ({ name, value, schema, onChange, error, depth = 0, domContextId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const objectValue = value as Record<string, FormValue> || {};

  if (!schema.properties) {
    return <div>Error: Object field missing properties</div>;
  }

  const handleFieldChange = (fieldName: string, fieldValue: FormValue, triggerValidation = false) => {
    onChange({
      ...objectValue,
      [fieldName]: fieldValue
    }, triggerValidation);
  };

  const thisId = domContextId ? `${domContextId}.${name}` : name;

  return (
    <div id={thisId} data-testid={thisId} style={{ marginLeft: `${depth * 16}px` }}>
      <button 
        type="button"
        id={`${thisId}-accordion`}
        data-testid={`${thisId}-accordion`}
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        {isExpanded ? '▼' : '▶'} {capitalizeFirstLetter(schema.title || name)}
      </button>
      {isExpanded && (
        <div style={{ borderLeft: depth > 0 ? '1px solid #ccc' : 'none', paddingLeft: '8px' }}>
          {Object.entries(schema.properties).map(([key, fieldSchema]) => {
            return (
              <FieldRenderer
                key={key}
                name={key}
                value={objectValue[key]}
                schema={fieldSchema}
                onChange={(val, triggerValidation = false) => handleFieldChange(key, val, triggerValidation)}
                error={error}
                domContextId={thisId}
                required={fieldSchema.required}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ObjectField;
