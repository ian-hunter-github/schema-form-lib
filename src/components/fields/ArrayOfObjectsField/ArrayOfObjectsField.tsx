import React, { useState } from 'react';
import type { FormField } from '../../../utils/formModel/types';
import type { FormModel } from '../../../utils/formModel/FormModel';
import type { JSONValue } from '../../../types/schema';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';
import { useThemeTokens, useVariants } from '../../../theme';
import { createStyles, mergeStyles, conditionalStyle } from '../../../theme/utils';
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
  
  // Get theme tokens and variants
  const { colors, spacing, typography, shadows, components } = useThemeTokens();
  const { variants } = useVariants();
  const styles = createStyles({ colors, spacing, typography, shadows, components, name: 'default', overrides: {} }, variants);

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
        style={mergeStyles(
          styles.arrayItem,
          conditionalStyle(itemField?.hasChanges || false, styles.fieldInputDirty)
        )}
      >
        {/* Item Header */}
        <div 
          style={mergeStyles(
            styles.arrayHeader,
            { borderBottom: isExpanded ? `1px solid ${colors.border.primary}` : 'none' }
          )}
          onClick={() => toggleItemExpansion(itemIndex)}
        >
          <span 
            style={{ 
              marginRight: spacing.xs,
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          >
            ▶
          </span>
          <span style={{ flex: 1, fontWeight: typography.field.label.fontWeight }}>
            Item {itemIndex + 1}
          </span>
          
          {itemField?.dirty && (
            <div 
              style={mergeStyles(
                styles.fieldHelper,
                { marginRight: spacing.sm }
              )}
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
            style={mergeStyles(
              styles.button,
              styles.buttonDanger,
              { fontSize: typography.field.helper.fontSize }
            )}
            data-testid={`${fieldId}.${itemIndex}-remove`}
          >
            Remove
          </button>
        </div>

        {/* Item Content */}
        {isExpanded && (
          <div style={styles.arrayContent}>
            {propertyKeys.map(propertyKey => {
              const nestedField = getNestedField(itemIndex, propertyKey);
              if (!nestedField) return null;

              return (
                <div key={propertyKey} style={{ marginBottom: spacing.form.field }}>
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
              <div style={mergeStyles(
                styles.fieldHelper,
                { fontStyle: 'italic' }
              )}>
                No properties defined for this object
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div id={fieldId} data-testid={fieldId} style={styles.arrayContainer}>
      <label 
        htmlFor={fieldId} 
        id={`${fieldId}-label`}
        data-testid={`${fieldId}-label`}
        style={mergeStyles(
          styles.fieldLabel,
          { 
            fontWeight: typography.field.label.fontWeight,
            marginBottom: spacing.xs,
            display: 'block'
          }
        )}
      >
        {capitalizeFirstLetter(field.schema.title || displayName)}
        {field.required && <span style={{ color: colors.semantic.error }}> *</span>}
      </label>

      {field.schema.description && (
        <div 
          id={`${fieldId}-description`} 
          data-testid={`${fieldId}-description`}
          style={mergeStyles(
            styles.fieldDescription,
            { marginBottom: spacing.sm }
          )}
        >
          {field.schema.description}
        </div>
      )}

      {/* Array Items */}
      <div>
        {items.map((_, index) => renderObjectItem(index))}
        
        {items.length === 0 && (
          <div 
            style={{ 
              color: colors.text.tertiary,
              fontStyle: 'italic',
              padding: spacing.lg,
              textAlign: 'center' as const,
              border: `2px dashed ${colors.border.primary}`,
              borderRadius: '0.375rem',
              marginBottom: spacing.sm
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
        style={mergeStyles(
          styles.button,
          styles.buttonPrimary
        )}
      >
        Add Item
      </button>

      {/* Error Display */}
      {hasErrors && (
        <div 
          id={`${fieldId}-error`} 
          data-testid={`${fieldId}-error`} 
          style={mergeStyles(styles.fieldError, { marginTop: spacing.xs })}
        >
          {errorMessage}
        </div>
      )}
      
      {/* Dirty Indicator */}
      {field.dirty && (
        <div 
          id={`${fieldId}-dirty-indicator`} 
          data-testid={`${fieldId}-dirty-indicator`}
          style={mergeStyles(styles.fieldHelper, { marginTop: spacing.xs })}
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
