import type {
  JSONSchema,
  JSONSchemaProperties,
  JSONValue,
  FormValue,
} from "../types/schema";

export class FormValidator {
  static validateField(
    schema: JSONSchemaProperties,
    path: string,
    value: FormValue
  ): string[] {
    const errors: string[] = [];
    const fieldName = path.split('.').pop() || '';
    const field = schema[fieldName] || this.getNestedSchema(schema, path);

    if (!field || field.readOnly) {
      return errors;
    }

    if (value === "" || value === undefined) {
      errors.push("This field is required.");
    }

    if (field.type === "object" && field.properties) {
      const objectErrors = this.validateObject(
        field.properties,
        value as Record<string, JSONValue>,
        path
      );
      if (Object.keys(objectErrors).length > 0) {
        errors.push("Object contains invalid fields");
      }
    }

    if (field.type === "string" && typeof value === "string") {
      if (field.minLength && value.length < field.minLength) {
        errors.push(`Must be at least ${field.minLength} characters.`);
      }
      if (field.maxLength && value.length > field.maxLength) {
        errors.push(`Must be no more than ${field.maxLength} characters.`);
      }
    }

    if (field.type === "number") {
      const num = Number(value);
      if (isNaN(num)) {
        errors.push("Must be a number.");
      }
      if (field.minimum !== undefined && num < field.minimum) {
        errors.push(`Must be at least ${field.minimum}.`);
      }
      if (field.maximum !== undefined && num > field.maximum) {
        errors.push(`Must be no more than ${field.maximum}.`);
      }
    }

    return errors;
  }

  static validateObject(
    properties: JSONSchemaProperties,
    value: Record<string, JSONValue>,
    prefix = ""
  ): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    Object.keys(properties).forEach((key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const field = properties[key];
      const fieldValue = value?.[key];

      if (field.type === "object" && field.properties) {
        const nestedErrors = this.validateObject(
          field.properties,
          fieldValue as Record<string, JSONValue> || {},
          fullKey
        );
        Object.assign(errors, nestedErrors);
      } else {
        const fieldSchema = this.getNestedSchema(properties, key);
        const fieldErrors = fieldSchema 
          ? this.validateField(
              { [key]: fieldSchema } as JSONSchemaProperties,
              fullKey,
              fieldValue
            )
          : this.validateField(properties, fullKey, fieldValue);
        
        if (fieldErrors.length > 0) {
          errors[fullKey] = fieldErrors;
        }
      }
    });

    return errors;
  }

  static validateForm(
    formData: Record<string, JSONValue>,
    schema: JSONSchemaProperties
  ): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      const fieldSchema = this.getNestedSchema(schema, key);
      
      if (fieldSchema?.type === "object" && fieldSchema.properties) {
        const objectErrors = this.validateObject(
          fieldSchema.properties,
          value as Record<string, JSONValue>,
          key
        );
        Object.assign(errors, objectErrors);
      } else {
        const fieldErrors = this.validateField(schema, key, value);
        if (fieldErrors.length > 0) {
          errors[key] = fieldErrors;
        }
      }
    });

    return errors;
  }

  private static getNestedSchema(
    schema: JSONSchemaProperties,
    path: string
  ): JSONSchema | undefined {
    const parts = path.split(".");
    let current: JSONSchema | undefined = {
      type: "object",
      properties: schema,
    };

    for (const part of parts) {
      if (!current || typeof current !== "object" || !("properties" in current)) {
        return undefined;
      }

      const properties = current.properties as JSONSchemaProperties;
      if (!properties) return undefined;

      current = properties[part];
      if (!current || typeof current !== "object") {
        return undefined;
      }
    }

    return current;
  }
}
