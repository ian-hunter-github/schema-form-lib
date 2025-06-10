import StringField from './fields/StringField';
import NumberField from './fields/NumberField';
import BooleanField from './fields/BooleanField';
import ArrayOfPrimitiveField from './fields/ArrayOfPrimitiveField';
import ObjectField from './fields/ObjectField';

export const fieldComponents = {
  string: StringField,
  number: NumberField,
  boolean: BooleanField,
  array: ArrayOfPrimitiveField,
  object: ObjectField,
} as const;

export type FieldComponentType = keyof typeof fieldComponents;
