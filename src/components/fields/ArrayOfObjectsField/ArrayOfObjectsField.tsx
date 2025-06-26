import React, { useState } from 'react';
import type { FormField } from '../../../utils/formModel/types';
import type { FormModel } from '../../../utils/formModel/FormModel';
import type { JSONValue } from '../../../types/schema';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';
import FieldRenderer from '../../FieldRenderer';

export interface ArrayOfObjectsFieldProps {
  field: FormField;
  onChange: (value: JSONValue[], shouldValidate?: boolean) => void;
  formModel: FormModel;
}

const ArrayOfObjectsField: React.FC<ArrayOfObjectsFieldProps> = ({ field, formModel }) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  
  const fieldId = field.path;
  const displayName = field.path.split('.').pop() || field.path;
  const hasErrors = field.errors.length > 0;
  const errorMessage = hasErrors ? field.errors[0] : undefined;

  // Get items directly from FormModel
  const items = Array.isArray(field.value) ? field.value : [];
  const itemSchema = field.schema.items;

  const handleAddItem = () => {
    // Create a default object based on the item schema
    const defaultValue = createDefaultObjectValue(itemSchema);
    formModel.addValue(field.path, defaultValue);
  };

  const handleRemoveItem = (index: number) => {
    const elementPath = `${field.path}.${index}`;
    formModel.deleteValue(elementPath);
    
    // Remove from expanded items and adjust indices
    const newExpandedItems = new Set<number>();
    expandedItems.forEach(expandedIndex => {
      if (expandedIndex < index) {
        newExpandedItems.add(expandedIndex);
      } else if (expandedIndex > index) {
        newExpandedItems.add(expandedIndex - 1);
      }
    });
    setExpandedItems(newExpandedItems);
  };

  const toggleItemExpansion = (index: number) => {
    const newExpandedItems = new Set(expandedItems);
    if (newExpandedItems.has(index)) {
      newExpandedItems.delete(index);
    } else {
      newExpandedItems.add(index);
    }
    setExpandedItems(newExpandedItems);
  };

  const handleNestedChange = (itemIndex: number, propertyKey: string, value: JSONValue, shouldValidate?: boolean) => {
    const nestedPath = `${field.path}.${itemIndex}.${propertyKey}`;
    formModel.setValue(nestedPath, value);
    if (shouldValidate) {
      formModel.validate();
    }
  };

  const getNestedField = (itemIndex: number, propertyKey: string): FormField | undefined => {
    const nestedPath = `${field.path}.${itemIndex}.${propertyKey}`;
    return formModel.getField(nestedPath);
  };

  const renderObjectItem = (itemIndex: number) => {
    const isExpanded = expandedItems.has(itemIndex);
    const itemPath = `${field.path}.${itemIndex}`;
    const itemField = formModel.getField(itemPath);
    
    if (!itemSchema || !itemSchema.properties) {
      return null;
    }

    const properties = itemSchema.properties;
    const propertyKeys = Object.keys(properties);

    return (
      <div 
        key={itemIndex} 
        className="array-object-item"
        style={{
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          marginBottom: '12px',
          backgroundColor: itemField?.hasChanges ? '#fff3cd' : '#f8f9fa'
        }}
      >
        {/* Item Header */}
        <div 
          className="array-object-item-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            cursor: 'pointer',
            borderBottom: isExpanded ? '1px solid #dee2e6' : 'none'
          }}
          onClick={() => toggleItemExpansion(itemIndex)}
        >
          <span 
            style={{ 
              marginRight: '8px',
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          >
            ▶
          </span>
          <span style={{ flex: 1, fontWeight: 'bold' }}>
            Item {itemIndex + 1}
          </span>
          
          {itemField?.dirty && (
            <div 
              style={{ 
                fontSize: '0.8em', 
                color: '#666',
                marginRight: '12px'
              }}
            >
              Modified
            </div>
          )}
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveItem(itemIndex);
            }}
            disabled={field.schema.readOnly}
            style={{
              padding: '4px 8px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: field.schema.readOnly ? 'not-allowed' : 'pointer',
              fontSize: '0.8em'
            }}
            data-testid={`${fieldId}.${itemIndex}-remove`}
          >
            Remove
          </button>
        </div>

        {/* Item Content */}
        {isExpanded && (
          <div 
            className="array-object-item-content"
            style={{
              padding: '12px',
              paddingTop: '0'
            }}
          >
            {propertyKeys.map(propertyKey => {
              const nestedField = getNestedField(itemIndex, propertyKey);
              if (!nestedField) return null;

              return (
                <div key={propertyKey} style={{ marginBottom: '12px' }}>
                  <FieldRenderer
                    field={nestedField}
                    formModel={formModel}
                    onChange={(value: JSONValue, shouldValidate?: boolean) => 
                      handleNestedChange(itemIndex, propertyKey, value, shouldValidate)
                    }
                  />
                </div>
              );
            })}
            
            {propertyKeys.length === 0 && (
              <div style={{ color: '#666', fontStyle: 'italic' }}>
                No properties defined for this object
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div id={fieldId} data-testid={fieldId} className="field-container array-of-objects-field">
      <label 
        htmlFor={fieldId} 
        id={`${fieldId}-label`}
        data-testid={`${fieldId}-label`}
        className={field.required ? 'label required' : 'label'}
        style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}
      >
        {capitalizeFirstLetter(field.schema.title || displayName)}
      </label>

      {field.schema.description && (
        <div 
          id={`${fieldId}-description`} 
          data-testid={`${fieldId}-description`}
          style={{ 
            marginBottom: '12px',
            color: '#666',
            fontSize: '0.9em'
          }}
        >
          {field.schema.description}
        </div>
      )}

      {/* Array Items */}
      <div className="array-objects-container">
        {items.map((_, index) => renderObjectItem(index))}
        
        {items.length === 0 && (
          <div 
            style={{ 
              color: '#666', 
              fontStyle: 'italic',
              padding: '20px',
              textAlign: 'center',
              border: '2px dashed #dee2e6',
              borderRadius: '4px',
              marginBottom: '12px'
            }}
          >
            No items added yet
          </div>
        )}
      </div>

      {/* Add Button */}
      <button
        id={`${fieldId}-add`}
        data-testid={`${fieldId}-add`}
        type="button"
        onClick={handleAddItem}
        disabled={field.schema.readOnly}
        style={{
          padding: '10px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: field.schema.readOnly ? 'not-allowed' : 'pointer',
          fontWeight: 'bold'
        }}
      >
        Add Item
      </button>

      {/* Error Display */}
      {hasErrors && (
        <div 
          id={`${fieldId}-error`} 
          data-testid={`${fieldId}-error`} 
          style={{ color: 'red', marginTop: '8px' }}
        >
          {errorMessage}
        </div>
      )}
      
      {/* Dirty Indicator */}
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

// Helper function to create default object values
function createDefaultObjectValue(itemSchema: any): Record<string, any> {
  if (!itemSchema || !itemSchema.properties) {
    return {};
  }

  const defaultObj: Record<string, any> = {};
  const properties = itemSchema.properties;

  for (const [key, propSchema] of Object.entries(properties)) {
    const prop = propSchema as any;
    if (prop.default !== undefined) {
      defaultObj[key] = prop.default;
    } else {
      // Set appropriate default based on type
      switch (prop.type) {
        case 'string':
          defaultObj[key] = '';
          break;
        case 'number':
        case 'integer':
          defaultObj[key] = 0;
          break;
        case 'boolean':
          defaultObj[key] = false;
          break;
        case 'array':
          defaultObj[key] = [];
          break;
        case 'object':
          defaultObj[key] = {};
          break;
        default:
          defaultObj[key] = null;
      }
    }
  }

  return defaultObj;
}

export default ArrayOfObjectsField;
