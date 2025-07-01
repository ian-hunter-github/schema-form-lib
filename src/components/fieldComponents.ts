import StringField from './fields/StringField';
import NumberField from './fields/NumberField';
import BooleanField from './fields/BooleanField';
import EnumField from './fields/EnumField';
import ArrayOfPrimitiveField from './fields/ArrayOfPrimitiveField';
import ObjectField from './fields/ObjectField';
import { OneOfField } from './fields/OneOfField/OneOfField';

export const fieldComponents = {
  string: StringField,
  number: NumberField,
  boolean: BooleanField,
  enum: EnumField,
  array: ArrayOfPrimitiveField,
  object: ObjectField,
  oneOf: OneOfField,
} as const;

export type FieldComponentType = keyof typeof fieldComponents;
