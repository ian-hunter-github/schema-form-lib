import React from 'react';
import type { JSONValue } from '../../../types/schema';
import type { FormField } from '../../../types/fields';
import type { FormModel } from '../../../utils/form/FormModel';
import { ArrayFieldBase } from '../ArrayFieldBase';
import { capitalizeFirstLetter } from "../../../utils/StringUtils";
import styled from '@emotion/styled';
import type { Theme } from '../../../theme/styled';
import {
  StyledFieldLabel,
  StyledFieldDescription,
  StyledFieldInput,
  StyledFieldError,
} from '../../../theme/styled';

const StyledArrayContainer = styled.div<{ nestingDepth: number }>`
  margin: 0.5rem 0;
  padding: 1rem;
  border-radius: 0.375rem;
  background-color: ${(props) => {
    const depth = Math.min(props.nestingDepth, 10);
    const nestedColors = (props.theme as Theme).colors.background.nested;
    return nestedColors[depth as keyof typeof nestedColors] || nestedColors[0];
  }};
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
  nestingDepth: number;
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
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 10fr) minmax(0, 1fr)',
        width: '100%',
        gap: '0.5rem',
        marginBottom: '0.75rem',
        position: 'relative'
      }}>
        <div style={{ 
          position: 'relative',
          minWidth: 0,
          boxSizing: 'border-box'
        }}>
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
            style={{ 
              width: '100%',
              boxSizing: 'border-box'
            }}
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
          style={{ 
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0.25rem'
          }}
          aria-label="Remove item"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </StyledButton>
      </div>
    );
  }

  protected getDefaultItemValue(): JSONValue {
    return '';
  }

  render() {
    const { field,  } = this.props;
    const fieldId = field.path;
    const displayName = this.props.field.schema.title || 
                      this.props.field.path.split('.').pop() || 
                      this.props.field.path;
    const hasErrors = this.props.field.errors.length > 0;
    const errorMessage = hasErrors ? this.props.field.errors[0] : undefined;
    const items = this.getItems();

    return (
      <StyledArrayContainer id={fieldId} data-testid={fieldId} nestingDepth={this.props.nestingDepth}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <StyledFieldLabel
            htmlFor={fieldId}
            id={`${fieldId}-label`}
            data-testid={`${fieldId}-label`}
            required={this.props.field.required}
            style={{
              fontSize: '2rem',
              marginBottom: '0',
            }}
          >
            {capitalizeFirstLetter(displayName)}
          </StyledFieldLabel>

          <StyledButton
            id={`${fieldId}-add`}
            data-testid={`${fieldId}-add`}
            type="button"
            onClick={this.handleAddItem}
            disabled={this.props.field.schema.readOnly}
            variant="primary"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0',
            }}
            aria-label="Add item"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4V20M4 12H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </StyledButton>
        </div>

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

        {hasErrors && (
          <StyledFieldError 
            id={`${fieldId}-error`} 
            data-testid={`${fieldId}-error`}
          >
            {errorMessage}
          </StyledFieldError>
        )}
        
      </StyledArrayContainer>
    );
  }
}

export default ArrayOfPrimitiveField;
