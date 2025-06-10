import React, { useState } from 'react';
import type { FieldProps } from '../../types/schema';

const ArrayOfPrimitiveField: React.FC<FieldProps> = ({ name, value = [], schema, onChange, error, testIdPrefix }) => {
  const fieldTestId = testIdPrefix && testIdPrefix.endsWith(name) ? testIdPrefix : 
                    testIdPrefix ? `${testIdPrefix}.${name}` : name;
  const [items, setItems] = useState<string[]>(
    Array.isArray(value) ? value.map(String) : []
  );

  const handleAddItem = () => {
    const newItems = [...items, ''];
    setItems(newItems);
    onChange(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onChange(newItems);
  };

  const handleItemChange = (index: number, newValue: string) => {
    const newItems = [...items];
    newItems[index] = newValue;
    setItems(newItems);
    onChange(newItems);
  };

  return (
    <div>
      <label htmlFor={`${name}-0`} data-testid={`label-${fieldTestId}`}>
        {schema.title || name}
      </label>
      {schema.description && (
        <div data-testid={`description-${fieldTestId}`}>{schema.description}</div>
      )}
      {items.map((item, index) => (
        <div key={index}>
          <input
            data-testid={`${fieldTestId}-${index}`}
            type="text"
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            disabled={schema.readOnly}
          />
          <button
            data-testid={`${fieldTestId}-${index}-remove`}
            type="button"
            onClick={() => handleRemoveItem(index)}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        data-testid={`add-${fieldTestId}`}
        type="button"
        onClick={handleAddItem}
      >
        Add Item
      </button>
      {error && (
        <div data-testid={`error-${fieldTestId}`} style={{ color: 'red' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default ArrayOfPrimitiveField;
