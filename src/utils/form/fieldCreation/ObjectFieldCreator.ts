import type { JSONSchema, JSONValue } from '../../../types/schema';
import type { FormField } from '../../../types/fields';
import { FieldInitializer } from './FieldInitializer';
import { SchemaAnalyzer } from '../valueHandling/SchemaAnalyzer';
import { PathBuilder } from '../pathResolution/PathBuilder';
import { DefaultValueProvider } from '../valueHandling/DefaultValueProvider';
import { isJSONSchema, isJSONObject } from '../schemaUtils';

export class ObjectFieldCreator {
  static canHandle(schema: JSONSchema): boolean {
    return SchemaAnalyzer.isObjectSchema(schema);
  }

  static createField(
    fields: Map<string, FormField>,
    path: string,
    schema: JSONSchema,
    value?: JSONValue
  ): FormField {
    const objectValue = this.prepareObjectValue(schema, value);
    const field = FieldInitializer.createField(path, schema, objectValue);
    fields.set(path, field);
    
    // Create nested property fields
    this.createPropertyFields(fields, path, schema, objectValue);
    
    return field;
  }

  static createFieldsForSchema(
    fields: Map<string, FormField>,
    path: string,
    schema: JSONSchema
  ): void {
    this.createField(fields, path, schema);
  }

  private static prepareObjectValue(schema: JSONSchema, value?: JSONValue): Record<string, JSONValue> {
    if (value && isJSONObject(value)) {
      return value as Record<string, JSONValue>;
    }
    
    return DefaultValueProvider.getDefaultObjectValue(schema);
  }

  private static createPropertyFields(
    fields: Map<string, FormField>,
    basePath: string,
    schema: JSONSchema,
    objectValue: Record<string, JSONValue>
  ): void {
    if (!schema.properties) return;

    for (const [propertyName, propertySchema] of Object.entries(schema.properties)) {
      if (!isJSONSchema(propertySchema)) continue;

      const propertyPath = PathBuilder.buildPropertyPath(basePath, propertyName);
      const propertyValue = objectValue[propertyName];

      // Recursively create fields based on property schema type
      if (SchemaAnalyzer.isObjectSchema(propertySchema)) {
        this.createField(fields, propertyPath, propertySchema, propertyValue);
      } else if (SchemaAnalyzer.isArraySchema(propertySchema)) {
        // Import ArrayFieldCreator would create circular dependency, so we'll handle this in the factory
        const field = FieldInitializer.createField(propertyPath, propertySchema, propertyValue);
        fields.set(propertyPath, field);
      } else {
        // Primitive field
        const field = FieldInitializer.createField(propertyPath, propertySchema, propertyValue);
        fields.set(propertyPath, field);
      }
    }
  }

  static updateObjectProperty(
    fields: Map<string, FormField>,
    objectPath: string,
    propertyName: string,
    newValue: JSONValue
  ): void {
    const objectField = fields.get(objectPath);
    if (!objectField || !isJSONObject(objectField.value)) return;

    const objectValue = objectField.value as Record<string, JSONValue>;
    objectValue[propertyName] = newValue;
    
    FieldInitializer.markFieldDirty(objectField);

    // Update the property field if it exists
    const propertyPath = PathBuilder.buildPropertyPath(objectPath, propertyName);
    const propertyField = fields.get(propertyPath);
    if (propertyField) {
      FieldInitializer.updateFieldValue(propertyField, newValue);
    }
  }
}
