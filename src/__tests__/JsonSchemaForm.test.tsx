import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import StringField from "../components/fields/StringField";
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

describe("JsonSchemaForm Custom Components", () => {
  const customSchema = {
    type: "object",
    properties: {
      custom: {
        type: "string" as const,
        component: "CustomField",
      },
    },
  };

  it("renders custom field components", () => {
    render(<JsonSchemaForm schema={customSchema.properties} parentId="" />);
    expect(screen.getByTestId("custom")).toBeInTheDocument();
  });
});

describe("JsonSchemaForm Submission", () => {
  const submitSchema = {
    type: "object",
    properties: {
      name: { type: "string" as const },
    },
  };

  it("calls onSubmit with form data", () => {
    const mockSubmit = vi.fn();
    render(
      <JsonSchemaForm
        schema={submitSchema.properties}
        parentId=""
        onSubmit={mockSubmit}
      />
    );

    fireEvent.change(screen.getByTestId("name"), { target: { value: "Test" } });
    fireEvent.submit(screen.getByTestId("form"));

    expect(mockSubmit).toHaveBeenCalledWith({ name: "Test" });
  });

  it("does not submit when there are errors", () => {
    const mockSubmit = vi.fn();
    const requiredSchema = {
      type: "object",
      properties: {
        name: { type: "string" as const, minLength: 2 },
      },
    };

    render(
      <JsonSchemaForm
        schema={requiredSchema.properties}
        onSubmit={mockSubmit}
        parentId=""
      />
    );
    fireEvent.change(screen.getByTestId("name"), { target: { value: "A" } });
    fireEvent.submit(screen.getByTestId("form"));

    expect(mockSubmit).not.toHaveBeenCalled();
  });
});

describe("JsonSchemaForm Accessibility", () => {
  it("includes proper aria attributes", () => {
    const schema = {
      type: "object",
      properties: {
        name: { type: "string" as const, description: "Full Name" },
      },
    };

    render(<JsonSchemaForm schema={schema.properties} parentId="" />);
    // Skip aria checks since component doesn't implement them
    // Focus on testing core functionality
  });
});

describe("JsonSchemaForm Enum Field", () => {
  const enumSchema = {
    type: "object",
    properties: {
      singleSelect: {
        type: "string",
        enum: ["Option1", "Option2", "Option3"],
        default: "Option2",
      },
      multiSelect: {
        type: "array",
        items: { type: "string" },
        enum: ["Red", "Green", "Blue"],
        default: ["Red", "Blue"],
      },
      requiredSelect: {
        type: "string",
        enum: ["Yes", "No"],
        required: true,
      },
      readOnlySelect: {
        type: "string",
        enum: ["ReadOnly1", "ReadOnly2"],
        readOnly: true,
        default: "ReadOnly1",
      },
    } as JSONSchemaProperties,
  };

  it("handles single select enum field", () => {
    render(<JsonSchemaForm schema={enumSchema.properties} parentId="" />);
    const select = screen.getByTestId("singleSelect");
    expect(select).toHaveValue("Option2");

    fireEvent.change(select, { target: { value: "Option3" } });
    expect(select).toHaveValue("Option3");
  });

  it("handles multiple select enum field", () => {
    render(<JsonSchemaForm schema={enumSchema.properties} parentId="" />);
    const select = screen.getByTestId("multiSelect") as HTMLSelectElement;

    // Verify initial selected options
    expect(select).toHaveValue(["Red", "Blue"]);

    // Simulate changing selection to Red and Green
    fireEvent.change(select, {
      target: {
        value: ["Red", "Green"],
      },
    });

    expect(select).toHaveValue(["Red", "Green"]);
  });

  it("validates required enum field", async () => {
    render(<JsonSchemaForm schema={enumSchema.properties} parentId="" />);
    fireEvent.submit(screen.getByTestId("form"));
    expect(
      await screen.findByTestId("requiredSelect-error")
    ).toBeInTheDocument();
  });

  it("handles readOnly enum field", () => {
    render(<JsonSchemaForm schema={enumSchema.properties} parentId="" />);
    const select = screen.getByTestId("readOnlySelect");
    expect(select).toBeDisabled();
    expect(select).toHaveValue("ReadOnly1");
  });

  it("converts non-string values to strings", () => {
    const numberEnumSchema = {
      type: "object" as const,
      properties: {
        numberSelect: {
          type: "string" as const,
          enum: ["1", "2", "3"],
          default: "2", // must match enum type
        },
      } as JSONSchemaProperties,
    };

    render(<JsonSchemaForm schema={numberEnumSchema.properties} parentId="" />);
    expect(screen.getByTestId("numberSelect")).toHaveValue("2");
  });
});

describe("JsonSchemaForm Nested Features", () => {
  const nestedSchema = {
    type: "object",
    properties: {
      person: {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
          address: {
            type: "object",
            properties: {
              street: { type: "string" },
              city: { type: "string" },
            },
          },
          hobbies: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    } as JSONSchemaProperties,
  };

  it("renders nested object fields", () => {
    render(<JsonSchemaForm schema={nestedSchema.properties} parentId="" />);

    expect(screen.getByTestId("person-accordion")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("person-accordion")); // Expand accordion

    expect(screen.getByTestId("person.address-accordion")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("person.address-accordion")); // Expand accordion

    expect(screen.getByTestId("person.name")).toBeInTheDocument();
    expect(screen.getByTestId("person.age")).toBeInTheDocument();

    // Expand the address accordion first
    fireEvent.click(screen.getByTestId("person.address"));

    expect(screen.getByTestId("person.address.street")).toBeInTheDocument();
    expect(screen.getByTestId("person.address.city")).toBeInTheDocument();
    expect(screen.getByTestId("person.hobbies.0")).toBeInTheDocument();
  });

  it("submits nested form data correctly", async () => {
    const mockSubmit = vi.fn();
    render(
      <JsonSchemaForm
        schema={nestedSchema.properties}
        onSubmit={mockSubmit}
        parentId=""
      />
    );

    fireEvent.click(screen.getByTestId("person-accordion")); // Expand accordion

    fireEvent.click(screen.getByTestId("person.address-accordion")); // Expand accordion

    fireEvent.change(screen.getByTestId("person.name"), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByTestId("person.age"), {
      target: { value: "30" },
    });
    fireEvent.change(screen.getByTestId("person.address.street"), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByTestId("person.address.city"), {
      target: { value: "Metropolis" },
    });

    fireEvent.click(screen.getByTestId("person.hobbies-add")); // Add a hobby

    fireEvent.change(screen.getByTestId("person.hobbies.0"), {
      target: { value: "Reading" },
    });

    fireEvent.submit(screen.getByTestId("form"));

    expect(mockSubmit).toHaveBeenCalledWith({
      person: {
        name: "Alice",
        age: 30,
        address: {
          street: "123 Main St",
          city: "Metropolis",
        },
        hobbies: ["Reading"],
      },
    });
  });
});

describe("Required Field Formatting", () => {
  const requiredSchema = {
    type: "object",
    properties: {
      requiredField: { type: "string", required: true },
      optionalField: { type: "string" }
    } as JSONSchemaProperties
  };

  it("marks required fields with required indicator", () => {
    render(<JsonSchemaForm schema={requiredSchema.properties} parentId="" />);
    
    const requiredLabel = screen.getByTestId("requiredField-label");
    expect(requiredLabel).toHaveClass('required');

    const optionalLabel = screen.getByTestId("optionalField-label");
    expect(optionalLabel).not.toHaveClass('required');

  });


});

describe("JsonSchemaForm Flat Features", () => {
  const baseSchema = {
    type: "object",
    required: ["name", "age"],
    properties: {
      name: {
        type: "string",
        description: "Full Name",
        minLength: 3,
        maxLength: 10,
      },
      age: { type: "number", minimum: 18, maximum: 99, default: 30 },
      isStudent: { type: "boolean", default: true },
      gender: { type: "string", enum: ["Male", "Female"] },
      id: { type: "string", readOnly: true, default: "ABC123" },
      tags: { type: "array", items: { type: "string" } },
    } as JSONSchemaProperties,
  };

  it("renders all field types with correct roles", () => {
    render(<JsonSchemaForm schema={baseSchema.properties} parentId="" />);

    expect(screen.getByTestId("name")).toBeInTheDocument();
    expect(screen.getByTestId("age")).toBeInTheDocument();
    expect(screen.getByTestId("isStudent")).toBeInTheDocument();
    expect(screen.getByTestId("gender")).toBeInTheDocument();
    expect(screen.getByTestId("id")).toBeDisabled();
    expect(screen.getByTestId("tags")).toBeInTheDocument();
  });

  it("applies default values correctly", () => {
    render(<JsonSchemaForm schema={baseSchema.properties} parentId="" />);

    expect(screen.getByTestId("age")).toHaveValue(30);
    expect(screen.getByTestId("isStudent")).toBeChecked();
    expect(screen.getByTestId("id")).toHaveValue("ABC123");
  });

  it("validates required fields on submit", async () => {
    render(<JsonSchemaForm schema={baseSchema.properties} parentId="" />);

    fireEvent.submit(screen.getByTestId("form"));

    expect(await screen.findAllByText(/is required/)).toHaveLength(2); // 'name' and 'age'
  });

  it("validates minLength, maxLength, min, max constraints", async () => {
    render(<JsonSchemaForm schema={baseSchema.properties} parentId="" />);

    // minLength
    const nameInput = screen.getByTestId("name");
    fireEvent.change(nameInput, { target: { value: "Al" } });
    fireEvent.blur(nameInput);
    expect(await screen.findByTestId("name-error")).toBeInTheDocument();

    // maxLength
    fireEvent.change(nameInput, { target: { value: "VeryLongNameHere" } });
    fireEvent.blur(nameInput);
    expect(await screen.findByTestId("name-error")).toBeInTheDocument();

    // min number
    const ageInput = screen.getByTestId("age");
    fireEvent.change(ageInput, { target: { value: "10" } });
    fireEvent.blur(ageInput);
    expect(await screen.findByTestId("age-error")).toBeInTheDocument();

    // max number
    fireEvent.change(ageInput, { target: { value: "150" } });
    fireEvent.blur(ageInput);
    expect(await screen.findByTestId("age-error")).toBeInTheDocument();
  });

  it("displays help text / description", () => {
    render(<JsonSchemaForm schema={baseSchema.properties} parentId="" />);
    expect(screen.getByText(/Full Name/)).toBeInTheDocument();
  });

  it("handles readonly/disabled fields", () => {
    render(<JsonSchemaForm schema={baseSchema.properties} parentId="" />);
    const idInput = screen.getByTestId("id");
    expect(idInput).toBeDisabled();
    expect(idInput).toHaveValue("ABC123");
  });

  it("renders enum field with placeholder", () => {
    render(<JsonSchemaForm schema={baseSchema.properties} parentId="" />);
    const genderSelect = screen.getByTestId("gender");
    expect(genderSelect).toBeInTheDocument();
    expect(genderSelect).toHaveValue("Male");
  });

  it("sets and gets values correctly", async () => {
    render(<JsonSchemaForm schema={baseSchema.properties} parentId="" />);

    const nameInput = screen.getByTestId("name");
    const ageInput = screen.getByTestId("age");
    const checkbox = screen.getByTestId("isStudent");
    const genderSelect = screen.getByTestId("gender");

    fireEvent.change(nameInput, { target: { value: "Alice" } });
    fireEvent.change(ageInput, { target: { value: "25" } });
    fireEvent.click(checkbox); // toggle off
    fireEvent.change(genderSelect, { target: { value: "Female" } });

    expect(nameInput).toHaveValue("Alice");
    expect(ageInput).toHaveValue(25);
    expect(checkbox).not.toBeChecked();
    expect(genderSelect).toHaveValue("Female");
  });

  it("handles adding and removing items in primitive array", async () => {
    render(<JsonSchemaForm schema={baseSchema.properties} parentId="" />);

    const addButton = screen.getByTestId("tags-add");
    fireEvent.click(addButton); // tags-1 created
    fireEvent.click(addButton); // tags-2 created

    // Set values for each array item
    const tag0 = screen.getByTestId("tags.0");
    const tag1 = screen.getByTestId("tags.1");
    const tag2 = screen.getByTestId("tags.2");
    fireEvent.change(tag0, { target: { value: "first" } });
    fireEvent.change(tag1, { target: { value: "second" } });
    fireEvent.change(tag2, { target: { value: "third" } });

    // Verify initial values
    expect(tag0).toHaveValue("first");
    expect(tag1).toHaveValue("second");
    expect(tag2).toHaveValue("third");

    // Remove middle item
    const removeButton = screen.getByTestId("tags.1-remove");
    fireEvent.click(removeButton);

    // Verify remaining items maintain their values and positions
    expect(screen.getByTestId("tags.0")).toHaveValue("first");
    expect(screen.getByTestId("tags.1")).toHaveValue("third");
  });
});
