import { render, screen, fireEvent, prettyDOM } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  toBeInTheDocument,
  toHaveValue,
  toBeChecked,
  toBeDisabled,
  toHaveTextContent,
  toHaveAttribute,
  toHaveClass,
} from "@testing-library/jest-dom/matchers";
import JsonSchemaForm from "../components/JsonSchemaForm";
import type { JSONSchemaProperties } from "../types/schema";

expect.extend({
  toBeInTheDocument,
  toHaveValue,
  toBeChecked,
  toBeDisabled,
  toHaveTextContent,
  toHaveAttribute,
  toHaveClass,
});

describe("Nested Object with Required/Optional Fields", () => {
  const nestedSchema = {
    type: "object",
    properties: {
      person: {
        type: "object",
        properties: {
          firstName: { type: "string", required: true },
          lastName: { type: "string" } // optional
        }
      }
    } as JSONSchemaProperties
  };

  it("shows no error when required field is modified", async () => {
    const { container } = render(<JsonSchemaForm schema={nestedSchema.properties} parentId="" />);
    
    // Expand the nested object
    fireEvent.click(screen.getByTestId("person-accordion"));
    
    const firstNameInput = screen.getByTestId("person.firstName");
    fireEvent.change(firstNameInput, { target: { value: "John" } });
    fireEvent.blur(firstNameInput);
    
    console.log('After modifying required field:', prettyDOM(container));
    // Required field should not show error when valid
    expect(screen.queryByTestId("person.firstName-error")).not.toBeInTheDocument();
  });

  it("shows error when required field is blank", async () => {
    const { container } = render(<JsonSchemaForm schema={nestedSchema.properties} parentId="" />);
    
    // Expand the nested object
    fireEvent.click(screen.getByTestId("person-accordion"));
    
    const firstNameInput = screen.getByTestId("person.firstName");
    fireEvent.change(firstNameInput, { target: { value: "" } });
    fireEvent.blur(firstNameInput);
    
    console.log('After blanking required field:', prettyDOM(container));
    expect(await screen.findByTestId("person.firstName-error")).toBeInTheDocument();
  });

  it("shows no error when optional field is modified", async () => {
    const { container } = render(<JsonSchemaForm schema={nestedSchema.properties} parentId="" />);
    
    // Expand the nested object
    fireEvent.click(screen.getByTestId("person-accordion"));
    
    const lastNameInput = screen.getByTestId("person.lastName");
    fireEvent.change(lastNameInput, { target: { value: "Doe" } });
    fireEvent.blur(lastNameInput);
    
    console.log('After modifying optional field:', prettyDOM(container));
    // Optional field should never show error
    expect(screen.queryByTestId("person.lastName-error")).not.toBeInTheDocument();
  });

  it("shows no error when optional field is blank", async () => {
    const { container } = render(<JsonSchemaForm schema={nestedSchema.properties} parentId="" />);
    
    // Expand the nested object
    fireEvent.click(screen.getByTestId("person-accordion"));
    
    const lastNameInput = screen.getByTestId("person.lastName");
    fireEvent.change(lastNameInput, { target: { value: "" } });
    fireEvent.blur(lastNameInput);
    
    console.log('After blanking optional field:', prettyDOM(container));
    // Optional field should never show error
    expect(screen.queryByTestId("person.lastName-error")).not.toBeInTheDocument();
  });
});

// ... rest of the file remains unchanged ...
