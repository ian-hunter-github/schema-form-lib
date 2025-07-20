import React from "react";
import FormContainer from "../components/FormContainer";
import { useFormModel } from "../hooks/useFormModel";
import type { JSONSchema } from "../types/schema";

const FormContainerDemo: React.FC = () => {
  // const schema: JSONSchema = {

  //   type: "object",
  //   required: ["name", "email"],
  //   properties: {
  //     name: {
  //       type: "string",
  //       title: "Full Name",
  //       minLength: 3,
  //       maxLength: 50,
  //     },
  //     email: {
  //       type: "string",
  //       format: "email",
  //       title: "Email Address",
  //     },
  //     age: {
  //       type: "integer",
  //       title: "Age",
  //       minimum: 13,
  //       maximum: 120,
  //     },
  //     birthDate: {
  //       type: "string",
  //       format: "date",
  //       title: "Birth Date",
  //     },
  //     isStudent: {
  //       type: "boolean",
  //       title: "Are you a student?",
  //     },
  //     address: {
  //       type: "object",
  //       title: "Address (required if 18+)",
  //       properties: {
  //         street: { type: "string" },
  //         city: { type: "string" },
  //         country: {
  //           type: "string",
  //           enum: ["US", "UK", "CA", "AU", "Other"],
  //         },
  //       },
  //     },
  //     hobbies: {
  //       type: "array",
  //       title: "Hobbies",
  //       items: {
  //         type: "string",
  //         enum: ["Reading", "Sports", "Music", "Cooking", "Travel"],
  //       },
  //       uniqueItems: true,
  //     },
  //     skills: {
  //       type: "array",
  //       title: "Skills",
  //       items: {
  //         type: "object",
  //         properties: {
  //           name: { type: "string" },
  //           level: {
  //             type: "string",
  //             enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
  //           },
  //         },
  //       },
  //     },
  //     favoriteColor: {
  //       type: "string",
  //       format: "color",
  //       title: "Favorite Color",
  //     },
  //   },
  // };

  const schema2: JSONSchema = {
    type: "object",
    properties: {
      name: {
        type: "string",
        title: "Full Name",
        isRequired: true,
        minLength: 3,
      },
      friends: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
              title: "Friend's Name",
              isRequired: true,
            },
            age: {
              type: "integer",
              title: "Friend's Age",
              minimum: 0,
            },
          },
        },
      },
      tags: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
  };

  // const initialValues = {
  //   name: "Alice",
  //   email: "alice@example.com",
  //   age: 30,
  //   isStudent: false,
  //   hobbies: ["Reading"],
  //   skills: [{ name: "JavaScript", level: "Advanced" }],
  //   address: {
  //     street: "123 Main St",
  //     city: "New York",
  //     country: "US",
  //   },
  // };

  const { formModel } = useFormModel({
    schema: schema2,
    //initialValues
  });

  const callback = (data: Record<string, unknown>) => {
    alert(JSON.stringify(data, null, 2));
    console.log("Form submitted:", data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Enhanced Form Demo</h1>
      <FormContainer formModel={formModel} onSubmit={callback} />
    </div>
  );
};

export default FormContainerDemo;
