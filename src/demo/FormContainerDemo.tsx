import React from "react";
import FormContainer from "../components/FormContainer";
import { useFormModel } from "../hooks/useFormModel";
import type { JSONSchema } from "../types/schema";

const FormContainerDemo: React.FC = () => {

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
            friendsOfFriends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    title: "Friend of Friend's Name",
                    isRequired: true,
                  },
                  relationship: {
                    type: "string",
                    title: "Relationship Type",
                  },
                  friendsOfFriendsOfFriends: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: {
                          type: "string",
                          title: "Friend of Friend of Friend's Name",
                        },
                        metDate: {
                          type: "string",
                          format: "date",
                          title: "Date Met",
                        }
                      }
                    }
                  }
                }
              }
            }
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
