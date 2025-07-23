import React from "react";
import { useTheme } from "../theme";
import styled from '@emotion/styled';
import type { Colors } from '../theme/tokens/colors';
import FormRenderer from "./FormRenderer";
import type { FormModel } from "../utils/form/FormModel";
import type { LayoutConfig } from "../types/layout";

interface FormContainerProps {
  formModel: FormModel;
  onSubmit?: (data: Record<string, unknown>) => void;
  layoutConfig?: LayoutConfig;
  /** Whether to show field descriptions (default: true) */
  showDescriptions?: boolean;
  /** Current nesting depth for nested fields */
  nestingDepth: number;
}

const FormContainer: React.FC<FormContainerProps> = ({
  formModel,
  onSubmit,
  layoutConfig,
  showDescriptions = true,
  nestingDepth,
}) => {
  const { theme } = useTheme();
  const { colors, components, shadows, layout } = theme;

  const handleMouseEnter = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT"
    ) {
      target.style.borderColor = colors.primary[500];
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT"
    ) {
      target.style.borderColor = colors.border.primary;
    }
  };

  const handleFocus = (e: React.FocusEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT"
    ) {
      target.style.borderColor = colors.primary[500];
      target.style.boxShadow = `0 0 0 2px ${shadows.focus}`;
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT"
    ) {
      target.style.borderColor = colors.border.primary;
      target.style.boxShadow = "none";
    }
  };

  return (
    <StyledFormContainer
      borderColor={colors.border.primary}
      borderRadius={components.field.input.borderRadius}
      padding={layout.form.padding}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <FormRenderer
        formModel={formModel}
        onSubmit={onSubmit}
        layoutConfig={layoutConfig}
        showDescriptions={showDescriptions}
        nestingDepth={nestingDepth}
      />
    </StyledFormContainer>
  );
};

const StyledFormContainer = styled.div<{
  borderColor: string;
  borderRadius: string;
  padding: string;
}>`
  border: 1px solid ${props => props.borderColor};
  border-radius: ${props => props.borderRadius};
  padding: ${props => props.padding};
  width: 100%;
  background-color: ${(props) => (props.theme as { colors: Colors }).colors.background.nested[0]};
`;

export default FormContainer;
