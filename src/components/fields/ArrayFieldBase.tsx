import React from 'react';
import type { JSONValue } from '../../types/schema';
import type { FormFieldProps } from '../../types/fields';
import type { FormModel } from '../../utils/form/FormModel';
import { BaseField } from './BaseField';

export interface ArrayFieldProps extends FormFieldProps {
  formModel: FormModel;
}

export abstract class ArrayFieldBase<P extends ArrayFieldProps = ArrayFieldProps> extends BaseField<P> {
  protected abstract renderItem(index: number): React.ReactNode;

  protected getDefaultItemValue(): JSONValue {
    if (!this.props.field.schema.items) {
      throw new Error('Cannot create default value - no item schema defined');
    }

    const itemSchema = this.props.field.schema.items;
    if (itemSchema.type === 'object') {
      return {};
    } else if (itemSchema.type === 'array') {
      return [];
    } else if (itemSchema.type === 'string') {
      return itemSchema.default || '';
    } else if (itemSchema.type === 'number') {
      return itemSchema.default || 0;
    } else if (itemSchema.type === 'boolean') {
      return itemSchema.default || false;
    }
    return undefined;
  }

  protected handleAddItem = (): void => {
    try {
      if (!this.props.field.schema.items) {
        throw new Error('Cannot add item - no item schema defined');
      }
      const defaultValue = this.getDefaultItemValue();
      this.props.formModel.addValue(this.props.field.path, defaultValue);
    } catch (error) {
      console.error('Cannot add item - no item schema defined', error);
      if (this.props.onError) {
        this.props.onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }

  protected handleRemoveItem(index: number): void {
    const elementPath = `${this.props.field.path}.${index}`;
    this.props.formModel.deleteValue(elementPath);
  }

  protected handleItemChange(index: number, value: JSONValue): void {
    const elementPath = `${this.props.field.path}.${index}`;
    this.props.formModel.setValue(elementPath, value);
  }

  protected handleItemBlur(index: number, value: JSONValue): void {
    const elementPath = `${this.props.field.path}.${index}`;
    this.props.formModel.setValue(elementPath, value);
    this.props.formModel.validate();
  }

  protected getItems(): JSONValue[] {
    return Array.isArray(this.props.field.value) ? this.props.field.value : [];
  }

  protected isItemExpanded(_index: number): boolean { // eslint-disable-line @typescript-eslint/no-unused-vars
    return false; // Default implementation - can be overridden
  }

  protected toggleItemExpansion(_index: number): void { // eslint-disable-line @typescript-eslint/no-unused-vars
    // Default no-op implementation - can be overridden
  }

  // Override BaseField methods for array-specific behavior
  protected setValue(value: JSONValue): void {
    // Special handling for array values
    if (!Array.isArray(value)) {
      console.warn('Attempted to set non-array value to array field');
      return;
    }
    super.setValue(value);
  }

  protected notifyParent(): void {
    if (this.props.onChange) {
      this.props.onChange(this.currentValue, false);
    }
  }

  // Array-specific dirty tracking
  protected isItemDirty(index: number): boolean {
    const elementPath = `${this.props.field.path}.${index}`;
    return this.props.formModel.getAggregatedDirtyState(elementPath);
  }
}
