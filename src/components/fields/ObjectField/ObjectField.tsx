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
  StyledFieldLabel,
  StyledFieldDescription,
  StyledFieldError,
  StyledFieldHelper,
} from '../../../theme/styled';
import type { Theme } from '../../../theme/styled';
import styled from '@emotion/styled';

export interface ObjectFieldProps extends BaseFieldProps {
  field: FormField;
  onChange: (value: JSONValue, shouldValidate?: boolean) => void;
  formModel: FormModel;
  nestingDepth: number;
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
    this.isExpanded = !this.isExpanded;
    this.setState({});
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
    const { field, formModel, nestingDepth } = this.props;

    const fieldId = field.path;
    const displayName = field.path.split('.').pop() || field.path;
    const hasErrors = this.errors.length > 0;
    const errorMessage = hasErrors ? this.errors[0] : undefined;

    // Get the object properties from the schema
    const properties = field.schema.properties || {};
    const propertyKeys = Object.keys(properties);

    return (
      <StyledObjectContainer nestingDepth={this.props.nestingDepth}>
        <HeaderContainer onClick={this.toggleExpanded}>
          <span 
            style={{ 
              marginRight: '0.25rem',
              transform: this.isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
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
        </HeaderContainer>

        {this.isExpanded && (
          <ContentContainer>
            {field.schema.description && (
              <StyledFieldDescription
                id={`${fieldId}-description`}
                data-testid={`${fieldId}-description`}
                style={{ marginBottom: '0.5rem' }}
              >
                {field.schema.description}
              </StyledFieldDescription>
            )}

            {propertyKeys.length > 0 ? (
              <LayoutContainer
                fields={this.getNestedFields(propertyKeys)}
                formModel={formModel}
                layoutConfig={this.getObjectLayoutConfig()}
                onChange={this.handleNestedChange}
                nestingDepth={nestingDepth + 1}
              />
            ) : (
              <StyledFieldHelper style={{ fontStyle: 'italic' }}>
                No properties defined for this object
              </StyledFieldHelper>
            )}

            {hasErrors && formModel?.shouldShowErrors() && (
              <StyledFieldError
                id={`${fieldId}-error`}
                data-testid={`${fieldId}-error`}
              >
                {errorMessage}
              </StyledFieldError>
            )}
          </ContentContainer>
        )}
      </StyledObjectContainer>
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

const StyledObjectContainer = styled.div<{ nestingDepth: number }>`
  margin: 0.5rem 0;
  padding: 0;
  border-radius: 0.375rem;
  overflow: hidden;
  background-color: ${(props) => {
    const depth = Math.min(props.nestingDepth, 10);
    const nestedColors = (props.theme as Theme).colors.background.nested;
    return nestedColors[depth as keyof typeof nestedColors];
  }};
`;

const HeaderContainer = styled.div`
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(0,0,0,0.1);
`;

const ContentContainer = styled.div`
  padding: 1rem;
`;

const MemoizedObjectField = memo(ObjectField as React.ComponentType<ObjectFieldProps>, areEqual);
export default MemoizedObjectField;
