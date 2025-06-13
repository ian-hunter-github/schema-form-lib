import React from "react";
import type { FieldProps } from "../types/schema";
import { fieldComponents } from "./fieldComponents";
import EnumField from "./fields/EnumField";

const FieldRenderer: React.FC<FieldProps> = (props) => {
  const FieldComponent = props.schema.enum
    ? EnumField
    : props.schema.properties
    ? fieldComponents.object
    : fieldComponents[props.schema.type] ||
      (() => (
        <div id={`error-${props.name}`} style={{ color: "red" }}>
          Unsupported field type: {props.schema.type}
        </div>
      ));

  console.log(
    "Rendering field:",
    props.name,
    "with type:",
    props.schema.type,
    "and parentId:",
    props.parentId
  );

  return <FieldComponent {...props} />;
};

export default FieldRenderer;
