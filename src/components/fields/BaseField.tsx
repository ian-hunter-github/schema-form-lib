import React from 'react';
import type { JSONValue } from '../../types/schema';
import type { FormFieldProps } from '../../types/fields';

function shallowEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return a === b;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!(key in (b as Record<string, unknown>))) return false;
    if ((a as Record<string, unknown>)[key] !== (b as Record<string, unknown>)[key]) return false;
  }
  return true;
}

function shallowClone<T extends JSONValue>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return [...obj] as T;
  return { ...obj } as T;
}

export interface BaseFieldProps extends FormFieldProps {
  className?: string;
}

export abstract class BaseField<P extends BaseFieldProps = BaseFieldProps> extends React.Component<P> {
  protected pristineValue: JSONValue;
  protected currentValue: JSONValue;
  protected errors: string[] = [];
  protected dirty = false;
  private validationTimeout: number | null = null;

  constructor(props: P) {
    super(props);
    this.pristineValue = shallowClone(props.field.value);
    this.currentValue = props.field.value;
  }

  protected setValue(value: JSONValue): void {
    this.currentValue = value;
    const newDirty = !shallowEqual(this.pristineValue, this.currentValue);
    if (this.dirty !== newDirty) {
      this.dirty = newDirty;
      this.setState({});
    }

    if (this.validationTimeout) {
      window.clearTimeout(this.validationTimeout);
    }
    this.validationTimeout = window.setTimeout(() => {
      this.validate();
      this.notifyParent();
    }, 200);
  }

  protected validate(): void {
    // To be implemented by child classes
    this.errors = [];
  }

  protected notifyParent(): void {
    if (this.props.onChange) {
      this.props.onChange(this.currentValue, false);
    }
  }

  componentWillUnmount(): void {
    if (this.validationTimeout) {
      window.clearTimeout(this.validationTimeout);
    }
  }

  isDirty(): boolean {
    return this.dirty;
  }

  clearDirty(): void {
    this.pristineValue = shallowClone(this.currentValue);
    this.dirty = false;
    this.notifyParent();
    this.setState({});
  }

  getPristineValue(): JSONValue {
    return this.pristineValue;
  }

  abstract render(): React.ReactNode;
}
