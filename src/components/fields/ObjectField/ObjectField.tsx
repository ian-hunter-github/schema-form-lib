import React, { memo } from 'react';
import { BaseField } from '../BaseField';
import type { BaseFieldProps } from '../BaseField';
import type { FormField } from '../../../types/fields';
import type { FormModel } from '../../../utils/form/FormModel';
import type { JSONValue } from '../../../types/schema';
import type { LayoutConfig, JSONSchemaWithLayout } from '../../../types/layout';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';
import LayoutContainer from '../../layout/LayoutContainer';
import {
  StyledFieldContainer,
  StyledFieldLabel,
  StyledFieldDescription,
  StyledFieldError,
  StyledFieldHelper,
} from '../../../theme/styled';

export interface ObjectFieldProps extends BaseFieldProps {
  field: FormField;
  onChange: (value: JSONValue, shouldValidate?: boolean) => void;
  formModel: FormModel;
}

class ObjectField extends BaseField<ObjectFieldProps> {
  private isExpanded = false;
  
  constructor(props: ObjectFieldProps) {
    super(props);
    this.isExpanded = false;
  }

  componentDidMount(): void {
    this.validate();
  }

  componentDidUpdate(prevProps: ObjectFieldProps): void {
    if (prevProps.field.errors !== this.props.field.errors) {
      this.validate();
    }
    if (prevProps.field.dirty !== this.props.field.dirty) {
      this.dirty = this.props.field.dirty;
      this.setState({}); // Use setState instead of forceUpdate
    }
  }

  isDirty(): boolean {
    return this.props.field.dirty || false;
  }
  
  protected validate(): void {
    this.errors = this.props.field.errors;
    this.setState({}); // Use setState instead of forceUpdate
  }

  private toggleExpanded = (): void => {
    console.log('toggleExpanded called, current isExpanded:', this.isExpanded);
    this.isExpanded = !this.isExpanded;
    console.log('toggleExpanded - new isExpanded:', this.isExpanded);
    this.setState({});
    console.log('setState completed');
  };

  private getNestedField = (propertyKey: string): FormField | undefined => {
    if (!this.props.formModel) return undefined;
    const nestedPath = this.props.field.path ? `${this.props.field.path}.${propertyKey}` : propertyKey;
    return this.props.formModel.getField(nestedPath);
  };

  private handleNestedChange = (path: string, value: JSONValue): void => {
    this.props.formModel.setValue(path, value);
    // Update our value from the form model
    this.setValue(this.props.formModel.getField(this.props.field.path).value);
    this.props.onChange?.(this.currentValue, false);
  };

  private getNestedFields = (propertyKeys: string[]): FormField[] => {
    const nestedFields: FormField[] = [];
    for (const propertyKey of propertyKeys) {
      const nestedField = this.getNestedField(propertyKey);
      if (nestedField) {
        nestedFields.push(nestedField);
      }
    }
    return nestedFields;
  };

  private getObjectLayoutConfig = (): LayoutConfig => {
    const schema = this.props.field.schema as JSONSchemaWithLayout;
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

  render(): React.ReactNode {
    const { field, formModel } = this.props;
    console.log('ObjectField render - isExpanded:', this.isExpanded);
    console.log('field errors:', field.errors);
    console.log('component errors:', this.errors);
    console.log('field dirty:', field.dirty);
    console.log('shouldShowDirty:', formModel?.shouldShowDirty(field));
    console.log('isDirty:', this.isDirty());
    const fieldId = field.path;
    const displayName = field.path.split('.').pop() || field.path;
    const hasErrors = this.errors.length > 0;
    const errorMessage = hasErrors ? this.errors[0] : undefined;

    // Get the object properties from the schema
    const properties = field.schema.properties || {};
    const propertyKeys = Object.keys(properties);

    return (
      <StyledFieldContainer>
        {/* Accordion Header */}
        <div 
          onClick={this.toggleExpanded}
          style={{ 
            marginBottom: this.isExpanded ? '0.5rem' : 0,
            display: 'flex',
            alignItems: 'center',
            padding: '0.5rem',
            cursor: 'pointer',
            borderBottom: this.isExpanded ? '1px solid #e5e7eb' : 'none'
          }}
        >
          <span 
            style={{ 
              marginRight: '0.25rem',
              transform: this.isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          >
            ▶
          </span>
          <StyledFieldLabel
            htmlFor={fieldId}
            id={`${fieldId}-label`}
            data-testid={`${fieldId}-label`}
            required={field.required}
            style={{ 
              margin: 0,
              cursor: 'pointer',
              flex: 1
            }}
          >
            {capitalizeFirstLetter(field.schema.title || displayName)}{field.required && <span style={{ color: '#dc2626' }}> *</span>}
          </StyledFieldLabel>
          
          {this.isDirty() && formModel?.shouldShowDirty(field) && (
            <StyledFieldHelper
              id={`${fieldId}-dirty-indicator-header`}
              data-testid={`${fieldId}-dirty-indicator-header`}
              style={{ 
                marginLeft: '0.5rem',
                color: '#ca8a04',
                fontWeight: '500'
              }}
            >
              Modified
            </StyledFieldHelper>
          )}
        </div>

      {/* Accordion Content */}
      {this.isExpanded && (
        <div 
          style={{
            paddingLeft: '1.5rem',
            borderLeft: '2px solid #e5e7eb',
            marginLeft: '0.5rem'
          }}
        >
          {field.schema.description && (
            <StyledFieldDescription
              id={`${fieldId}-description`}
              data-testid={`${fieldId}-description`}
              style={{ marginBottom: '0.5rem' }}
            >
              {field.schema.description}
            </StyledFieldDescription>
          )}

          {/* Render nested fields using LayoutContainer */}
          {propertyKeys.length > 0 ? (
            <LayoutContainer
              fields={this.getNestedFields(propertyKeys)}
              formModel={formModel}
              layoutConfig={this.getObjectLayoutConfig()}
              onChange={this.handleNestedChange}
            />
          ) : (
            <StyledFieldHelper style={{ fontStyle: 'italic' }}>
              No properties defined for this object
            </StyledFieldHelper>
          )}
        </div>
      )}

        {hasErrors && formModel?.shouldShowErrors() && (
          <div style={{ marginTop: '0.5rem' }}>
            <StyledFieldError
              id={`${fieldId}-error`}
              data-testid={`${fieldId}-error`}
            >
              {errorMessage}
            </StyledFieldError>
          </div>
        )}
        
      </StyledFieldContainer>
    );
  }
}

const areEqual = (prevProps: ObjectFieldProps, nextProps: ObjectFieldProps) => {
  return (
    prevProps.field.value === nextProps.field.value &&
    prevProps.field.errors === nextProps.field.errors &&
    prevProps.field.hasChanges === nextProps.field.hasChanges &&
    prevProps.field.schema === nextProps.field.schema
  );
};

const MemoizedObjectField = memo(ObjectField as React.ComponentType<ObjectFieldProps>, areEqual);
export default MemoizedObjectField;
