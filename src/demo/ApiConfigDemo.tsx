import React from "react";
import FormContainer from "../components/FormContainer";
import { useFormModel } from "../hooks/useFormModel";
import apiConfigSchemaJson from "../examples/schemas/api-config.all.schema.json";
import type { JSONSchema } from "../types/schema";

const apiConfigSchema = apiConfigSchemaJson as unknown as JSONSchema;

const ApiConfigDemo: React.FC = () => {
  const initialValues = {
    name: "User Management API",
    version: "1.0.0",
    description: "API for managing user accounts and permissions",
    createdAt: new Date().toISOString(),
    entities: [
      {
        name: "User",
        description: "System user account",
        attributes: [
          {
            name: "username",
            type: "string",
            required: true,
            description: "Unique username",
            validation: {
              minLength: 3,
              maxLength: 30
            }
          },
          {
            name: "email",
            type: "string",
            required: true,
            description: "User email address",
            validation: {
              pattern: "^\\S+@\\S+\\.\\S+$"
            }
          }
        ],
        relationships: [
          {
            name: "roles",
            type: "many-to-many",
            target: "Role",
            description: "Roles assigned to user"
          }
        ]
      }
    ],
    security: {
      authentication: {
        type: "jwt",
        jwt: {
          issuer: "user-management",
          audience: "web-app",
          expiresIn: "1h"
        }
      }
    },
    deployment: [
      {
        name: "Production",
        environment: "production",
        target: "aws",
        url: "https://api.users.example.com"
      }
    ]
  };

  const { formModel } = useFormModel({
    schema: apiConfigSchema,
    initialValues
  });

  const callback = (data: Record<string, unknown>) => {
    alert(JSON.stringify(data, null, 2));
    console.log("API Config submitted:", data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>API Configuration Demo</h1>
      <FormContainer formModel={formModel} onSubmit={callback} />
    </div>
  );
};

export default ApiConfigDemo;
