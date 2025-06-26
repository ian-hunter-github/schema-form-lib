import React, { useState } from 'react';
import type { FormField } from '../../../utils/formModel/types';
import type { FormModel } from '../../../utils/formModel/FormModel';
import type { JSONValue } from '../../../types/schema';
import type { LayoutConfig, JSONSchemaWithLayout } from '../../../types/layout';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';
import { useThemeTokens, useVariants } from '../../../theme';
import { createStyles, mergeStyles, conditionalStyle } from '../../../theme/utils';
import LayoutContainer from '../../layout/LayoutContainer';

export interface ObjectFieldProps {
  field: FormField;
  onChange: (value: JSONValue, shouldValidate?: boolean) => void;
  formModel: FormModel;
}

const ObjectField: React.FC<ObjectFieldProps> = ({ 
  field, 
  onChange, 
  formModel 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const fieldId = field.path;
  const displayName = field.path.split('.').pop() || field.path;
  const hasErrors = field.errors.length > 0;
  const errorMessage = hasErrors ? field.errors[0] : undefined;
  
  // Get theme tokens and variants
  const { colors, spacing, typography, shadows, components } = useThemeTokens();
  const { variants } = useVariants();
  const styles = createStyles({ colors, spacing, typography, shadows, components, name: 'default', overrides: {} }, variants);

  // Get the object properties from the schema
  const properties = field.schema.properties || {};
  const propertyKeys = Object.keys(properties);

  // Helper function to get nested field from FormModel
  const getNestedField = (propertyKey: string): FormField | undefined => {
    if (!formModel) return undefined;
    const nestedPath = field.path ? `${field.path}.${propertyKey}` : propertyKey;
    return formModel.getField(nestedPath);
  };

  // Helper function to handle nested field changes
  const handleNestedChange = (path: string, value: JSONValue) => {
    formModel.setValue(path, value);
    // Propagate the change up to parent
    if (onChange) {
      onChange(field.value);
    }
  };

  // Get nested fields for layout container
  const getNestedFields = (): FormField[] => {
    const nestedFields: FormField[] = [];
    for (const propertyKey of propertyKeys) {
      const nestedField = getNestedField(propertyKey);
      if (nestedField) {
        nestedFields.push(nestedField);
      }
    }
    return nestedFields;
  };

  // Get layout configuration from schema
  const getObjectLayoutConfig = (): LayoutConfig => {
    const schema = field.schema as JSONSchemaWithLayout;
    const layoutConfig = schema['x-layout'];
    
    if (layoutConfig) {
      return {
        strategy: 'grid-12', // Default for objects
        ...layoutConfig
      };
    }
    
    // Default layout for objects
    return { strategy: 'vertical' };
  };

  return (
    <div style={styles.fieldContainer}>
      {/* Accordion Header */}
      <div 
        style={mergeStyles(
          styles.arrayHeader,
          conditionalStyle(field.hasChanges, styles.fieldInputDirty),
          { marginBottom: isExpanded ? spacing.sm : 0 }
        )}
        onClick={() => setIsExpanded(!isExpanded)}
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
        <label 
          htmlFor={fieldId}
          id={`${fieldId}-label`}
          data-testid={`${fieldId}-label`}
          style={mergeStyles(
            styles.fieldLabel,
            { 
              fontWeight: typography.field.label.fontWeight,
              margin: 0,
              cursor: 'pointer',
              flex: 1
            }
          )}
        >
          {capitalizeFirstLetter(field.schema.title || displayName)}
          {field.required && <span style={{ color: colors.semantic.error }}> *</span>}
        </label>
        
        {field.dirty && (
          <div 
            id={`${fieldId}-dirty-indicator`}
            data-testid={`${fieldId}-dirty-indicator`}
            style={mergeStyles(
              styles.fieldHelper,
              { marginLeft: spacing.sm }
            )}
          >
            Modified
          </div>
        )}
      </div>

      {/* Accordion Content */}
      {isExpanded && (
        <div 
          style={{
            paddingLeft: spacing.lg,
            borderLeft: `2px solid ${colors.border.primary}`,
            marginLeft: spacing.sm
          }}
        >
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

          {/* Render nested fields using LayoutContainer */}
          {propertyKeys.length > 0 ? (
            <LayoutContainer
              fields={getNestedFields()}
              formModel={formModel}
              layoutConfig={getObjectLayoutConfig()}
              onChange={handleNestedChange}
            />
          ) : (
            <div style={mergeStyles(
              styles.fieldHelper,
              { fontStyle: 'italic' }
            )}>
              No properties defined for this object
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {hasErrors && (
        <div 
          id={`${fieldId}-error`}
          data-testid={`${fieldId}-error`}
          style={mergeStyles(
            styles.fieldError,
            { marginTop: spacing.xs }
          )}
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default ObjectField;
