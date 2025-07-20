import React from 'react';
import type { JSONValue } from '../../../types/schema';
import type { FormField } from '../../../types/fields';
import type { FormModel } from '../../../utils/form/FormModel';
import { ArrayFieldBase } from '../ArrayFieldBase';
import styled from '@emotion/styled';
import {
  StyledFieldLabel,
  StyledFieldDescription,
  StyledFieldInput,
  StyledFieldError,
  StyledFieldHelper,
} from '../../../theme/styled';

const StyledArrayContainer = styled.div`
  margin-bottom: 1rem;
`;

const StyledButton = styled.button<{
  variant?: 'primary' | 'danger';
  size?: 'sm' | 'md';
  disabled?: boolean;
}>`
  padding: ${props => props.size === 'sm' ? '0.25rem 0.5rem' : '0.5rem 1rem'};
  border-radius: 0.25rem;
  font-size: ${props => props.size === 'sm' ? '0.875rem' : '1rem'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  border: 1px solid transparent;

  ${props => props.variant === 'primary' && `
    background-color: ${props.disabled ? '#9ca3af' : '#3b82f6'};
    color: white;
    &:hover {
      background-color: ${props.disabled ? '#9ca3af' : '#2563eb'};
    }
  `}

  ${props => props.variant === 'danger' && `
    background-color: ${props.disabled ? '#9ca3af' : '#ef4444'};
    color: white;
    &:hover {
      background-color: ${props.disabled ? '#9ca3af' : '#dc2626'};
    }
  `}
`;

export interface ArrayOfPrimitiveFieldProps {
  field: FormField;
  onChange: (value: JSONValue, shouldValidate?: boolean) => void;
  formModel: FormModel;
}

class ArrayOfPrimitiveField extends ArrayFieldBase<ArrayOfPrimitiveFieldProps> {
  protected handleAddItem = (): void => {
    const defaultValue = this.getDefaultItemValue();
    this.props.formModel.addValue(this.props.field.path, defaultValue);
  };

  protected renderItem(index: number): React.ReactNode {
    const item = this.getItems()[index];
    const itemValue = item !== undefined ? String(item) : '';
    const hasValue = itemValue !== '';

    return (
      <div key={index} style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '0.75rem',
        position: 'relative'
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <StyledFieldInput
            id={`${this.props.field.path}.${index}`}
            data-testid={`${this.props.field.path}.${index}`}
            type="text"
            value={itemValue}
            onChange={(e) => this.handleItemChange(index, e.target.value)}
            onBlur={(e) => this.handleItemBlur(index, e.target.value)}
            disabled={this.props.field.schema.readOnly}
            isDirty={this.isItemDirty(index)}
            variant="floating"
            placeholder=" "
            style={{ width: '100%' }}
          />
          <StyledFieldLabel
            htmlFor={`${this.props.field.path}.${index}`}
            floating={true}
            active={hasValue}
            style={{
              position: 'absolute',
              left: '12px',
              transform: hasValue ? 'translateY(-8px) scale(0.85)' : 'translateY(12px)'
            }}
          >
            Item {index + 1}
          </StyledFieldLabel>
        </div>
        <StyledButton
          id={`${this.props.field.path}.${index}-remove`}
          data-testid={`${this.props.field.path}.${index}-remove`}
          type="button"
          onClick={() => this.handleRemoveItem(index)}
          disabled={this.props.field.schema.readOnly}
          variant="danger"
          size="sm"
        >
          Remove
        </StyledButton>
      </div>
    );
  }

  protected getDefaultItemValue(): JSONValue {
    return '';
  }

  render() {
    const fieldId = this.props.field.path;
    const displayName = this.props.field.schema.title || 
                      this.props.field.path.split('.').pop() || 
                      this.props.field.path;
    const hasErrors = this.props.field.errors.length > 0;
    const errorMessage = hasErrors ? this.props.field.errors[0] : undefined;
    const items = this.getItems();

    return (
      <StyledArrayContainer id={fieldId} data-testid={fieldId}>
        <StyledFieldLabel 
          htmlFor={fieldId} 
          id={`${fieldId}-label`}
          data-testid={`${fieldId}-label`}
          required={this.props.field.required}
        >
          {displayName}
        </StyledFieldLabel>

        {this.props.field.schema.description && (
          <StyledFieldDescription 
            id={`${fieldId}-description`} 
            data-testid={`${fieldId}-description`}
          >
            {this.props.field.schema.description}
          </StyledFieldDescription>
        )}

        {items.map((_, index) => this.renderItem(index))}

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

        <StyledButton
          id={`${fieldId}-add`}
          data-testid={`${fieldId}-add`}
          type="button"
          onClick={this.handleAddItem}
          disabled={this.props.field.schema.readOnly}
          variant="primary"
          style={{ marginTop: '0.5rem' }}
        >
          Add Item
        </StyledButton>

        {hasErrors && (
          <StyledFieldError 
            id={`${fieldId}-error`} 
            data-testid={`${fieldId}-error`}
          >
            {errorMessage}
          </StyledFieldError>
        )}
        
        {this.props.field.dirty && (
          <StyledFieldHelper 
            id={`${fieldId}-dirty-indicator`} 
            data-testid={`${fieldId}-dirty-indicator`}
          >
            Modified
          </StyledFieldHelper>
        )}
      </StyledArrayContainer>
    );
  }
}

export default ArrayOfPrimitiveField;
