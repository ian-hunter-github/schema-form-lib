import React, { useState } from 'react';
import type { FormField } from '../../../utils/formModel/types';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';

export interface ArrayOfPrimitiveFieldProps {
  field: FormField;
  onChange: (value: string[], triggerValidation?: boolean) => void;
  domContextId?: string;
}

const ArrayOfPrimitiveField: React.FC<ArrayOfPrimitiveFieldProps> = ({ field, onChange, domContextId }) => {
  const fieldId = domContextId ? `${domContextId}.${field.path}` : field.path;
  const displayName = field.path.split('.').pop() || field.path;
  const hasErrors = field.errors.length > 0;
  const errorMessage = hasErrors ? field.errors[0] : undefined;

  const [items, setItems] = useState<string[]>(
    Array.isArray(field.value) ? (field.value as string[]).map(String) : []
  );

  const handleAddItem = () => {
    const newItems = [...items, ''];
    setItems(newItems);
    onChange(newItems, false);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onChange(newItems, false);
  };

  const handleItemChange = (index: number, newValue: string) => {
    const newItems = [...items];
    newItems[index] = newValue;
    setItems(newItems);
    onChange(newItems, false);
  };

  const handleItemBlur = (index: number, newValue: string) => {
    const newItems = [...items];
    newItems[index] = newValue;
    setItems(newItems);
    onChange(newItems, true);
  };

  return (
    <div id={fieldId} data-testid={fieldId} className="field-container">
      <label 
        htmlFor={fieldId} 
        id={`${fieldId}-label`}
        data-testid={`${fieldId}-label`}
        className={field.required ? 'label required' : 'label'}
      >
        {capitalizeFirstLetter(field.schema.title || displayName)}
      </label>

      {field.schema.description && (
        <div 
          id={`${fieldId}-description`} 
          data-testid={`${fieldId}-description`}
        >
          {field.schema.description}
        </div>
      )}

      {items.map((item, index) => (
        <div key={index} className="array-item" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            id={`${fieldId}.${index}`}
            data-testid={`${fieldId}.${index}`}
            type="text"
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            onBlur={(e) => handleItemBlur(index, e.target.value)}
            disabled={field.schema.readOnly}
            style={{
              flex: 1,
              backgroundColor: field.hasChanges ? '#fff3cd' : undefined,
              ...field.hasChanges && { borderColor: '#ffc107' }
            }}
          />
          <button
            id={`${fieldId}.${index}-remove`}
            data-testid={`${fieldId}.${index}-remove`}
            type="button"
            onClick={() => handleRemoveItem(index)}
            disabled={field.schema.readOnly}
            style={{
              padding: '4px 8px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: field.schema.readOnly ? 'not-allowed' : 'pointer'
            }}
          >
            Remove
          </button>
        </div>
      ))}

      <button
        id={`${fieldId}-add`}
        data-testid={`${fieldId}-add`}
        type="button"
        onClick={handleAddItem}
        disabled={field.schema.readOnly}
        style={{
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: field.schema.readOnly ? 'not-allowed' : 'pointer',
          marginTop: '8px'
        }}
      >
        Add Item
      </button>

      {hasErrors && (
        <div 
          id={`${fieldId}-error`} 
          data-testid={`${fieldId}-error`} 
          style={{ color: 'red', marginTop: '8px' }}
        >
          {errorMessage}
        </div>
      )}
      
      {field.dirty && (
        <div 
          id={`${fieldId}-dirty-indicator`} 
          data-testid={`${fieldId}-dirty-indicator`}
          style={{ fontSize: '0.8em', color: '#666', marginTop: '4px' }}
        >
          Modified
        </div>
      )}
    </div>
  );
};

export default ArrayOfPrimitiveField;
