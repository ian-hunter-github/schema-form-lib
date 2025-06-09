import React from 'react';
import type { FieldProps } from '../types/schema';
import { fieldComponents } from './fieldComponents';
import EnumField from './fields/EnumField';

const FieldRenderer: React.FC<FieldProps> = (props) => {
  const FieldComponent = props.schema.enum 
    ? EnumField 
    : fieldComponents[props.schema.type] || (() => (
      <div data-testid={`error-${props.name}`} style={{ color: 'red' }}>
        Unsupported field type: {props.schema.type}
      </div>
    ));

  return <FieldComponent {...props} />;
};

export default FieldRenderer;
