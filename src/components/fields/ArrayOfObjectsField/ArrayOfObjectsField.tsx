import React, { useState } from 'react';
import type { FormField } from '../../../utils/formModel/types';
import type { FormModel } from '../../../utils/formModel/FormModel';
import type { JSONValue } from '../../../types/schema';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';
import FieldRenderer from '../../FieldRenderer';
import {
  StyledArrayContainer,
  StyledFieldLabel,
  StyledFieldDescription,
  StyledArrayItem,
  StyledArrayHeader,
  StyledArrayContent,
  StyledButton,
  StyledFieldError,
  StyledFieldHelper,
} from '../../../theme/styled';

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
      <StyledArrayItem 
        key={itemIndex} 
        isDirty={itemField?.hasChanges || false}
      >
        {/* Item Header */}
        <StyledArrayHeader 
          hasBottomBorder={isExpanded}
          onClick={() => toggleItemExpansion(itemIndex)}
        >
          <span 
            style={{ 
              marginRight: '0.25rem',
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          >
            ▶
          </span>
          <span style={{ flex: 1, fontWeight: '500' }}>
            Item {itemIndex + 1}
          </span>
          
          {itemField?.dirty && (
            <StyledFieldHelper style={{ marginRight: '0.5rem' }}>
              Modified
            </StyledFieldHelper>
          )}
          
          <StyledButton
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveItem(itemIndex);
            }}
            disabled={field.schema.readOnly}
            variant="danger"
            size="sm"
            data-testid={`${fieldId}.${itemIndex}-remove`}
          >
            Remove
          </StyledButton>
        </StyledArrayHeader>

        {/* Item Content */}
        {isExpanded && (
          <StyledArrayContent>
            {propertyKeys.map(propertyKey => {
              const nestedField = getNestedField(itemIndex, propertyKey);
              if (!nestedField) return null;

              return (
                <div key={propertyKey} style={{ marginBottom: '1rem' }}>
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
              <StyledFieldHelper style={{ fontStyle: 'italic' }}>
                No properties defined for this object
              </StyledFieldHelper>
            )}
          </StyledArrayContent>
        )}
      </StyledArrayItem>
    );
  };

  return (
    <StyledArrayContainer id={fieldId} data-testid={fieldId}>
      <StyledFieldLabel 
        htmlFor={fieldId} 
        id={`${fieldId}-label`}
        data-testid={`${fieldId}-label`}
        required={field.required}
        style={{ 
          fontWeight: '500',
          marginBottom: '0.25rem',
          display: 'block'
        }}
      >
        {capitalizeFirstLetter(field.schema.title || displayName)}
      </StyledFieldLabel>

      {field.schema.description && (
        <StyledFieldDescription 
          id={`${fieldId}-description`} 
          data-testid={`${fieldId}-description`}
          style={{ marginBottom: '0.5rem' }}
        >
          {field.schema.description}
        </StyledFieldDescription>
      )}

      {/* Array Items */}
      <div>
        {items.map((_, index) => renderObjectItem(index))}
        
        {items.length === 0 && (
          <div 
            style={{ 
              color: '#6b7280',
              fontStyle: 'italic',
              padding: '1.5rem',
              textAlign: 'center' as const,
              border: '2px dashed #e5e7eb',
              borderRadius: '0.375rem',
              marginBottom: '0.5rem'
            }}
          >
            No items added yet
          </div>
        )}
      </div>

      {/* Add Button */}
      <StyledButton
        id={`${fieldId}-add`}
        data-testid={`${fieldId}-add`}
        type="button"
        onClick={handleAddItem}
        disabled={field.schema.readOnly}
        variant="primary"
      >
        Add Item
      </StyledButton>

      {/* Error Display */}
      {hasErrors && (
        <StyledFieldError 
          id={`${fieldId}-error`} 
          data-testid={`${fieldId}-error`}
        >
          {errorMessage}
        </StyledFieldError>
      )}
      
      {/* Dirty Indicator */}
      {field.dirty && (
        <StyledFieldHelper 
          id={`${fieldId}-dirty-indicator`} 
          data-testid={`${fieldId}-dirty-indicator`}
        >
          Modified
        </StyledFieldHelper>
      )}
    </StyledArrayContainer>
  );
};

// Helper function to create default object values
function createDefaultObjectValue(itemSchema?: { properties?: Record<string, { type?: string; default?: JSONValue }> }): Record<string, JSONValue> {
  if (!itemSchema || !itemSchema.properties) {
    return {};
  }

  const defaultObj: Record<string, JSONValue> = {};
  const properties = itemSchema.properties;

  for (const [key, propSchema] of Object.entries(properties)) {
    const prop = propSchema;
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
