import StringField from './fields/StringField';
import NumberField from './fields/NumberField';
import BooleanField from './fields/BooleanField';
import EnumField from './fields/EnumField';
import ArrayOfPrimitiveField from './fields/ArrayOfPrimitiveField';
// TODO: ObjectField needs to be adapted to use FormField
// import ObjectField from './fields/ObjectField';

export const fieldComponents = {
  string: StringField,
  number: NumberField,
  boolean: BooleanField,
  enum: EnumField,
  array: ArrayOfPrimitiveField,
  // object: ObjectField,
} as const;

export type FieldComponentType = keyof typeof fieldComponents;
