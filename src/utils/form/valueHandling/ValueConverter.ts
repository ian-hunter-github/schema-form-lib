import type { JSONValue, FormValue } from '../../../types/schema';

export class ValueConverter {
  static convertFormValue(value: FormValue): JSONValue {
    if (Array.isArray(value)) {
      return value.map(item => this.convertFormValue(item));
    }
    if (typeof value === 'object' && value !== null) {
      const result: Record<string, JSONValue> = {};
      for (const [key, val] of Object.entries(value)) {
        result[key] = this.convertFormValue(val);
      }
      return result;
    }
    return value;
  }
}
