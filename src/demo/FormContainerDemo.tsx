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
                    enum: ["Family", "Friend", "Colleague", "Other"],
                    default: "Friend",
                  },
                  friendsOfFriendsOfFriends: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: {
                          type: "string",
                          title: "Friend of Friend of Friend's Name",
                          isRequired: true,
                        },
                        metDate: {
                          type: "string",
                          format: "date",
                          title: "Date Met",
                          isRequired: true,
                          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                          description: "Must be in YYYY-MM-DD format"
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

  const initialValues = {
    name: "John Doe",
    friends: [
      {
        name: "Jane Smith",
        age: 28,
        friendsOfFriends: [
          {
            name: "Mike Johnson",
            relationship: "Colleague",
            friendsOfFriendsOfFriends: [
              {
                name: "Sarah Williams",
                metDate: "2023-01-15"
              }
            ]
          }
        ]
      }
    ]
  };

  const { formModel } = useFormModel({
    schema: schema2,
    initialValues
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
