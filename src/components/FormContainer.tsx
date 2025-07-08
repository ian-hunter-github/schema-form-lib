import React from 'react';
import { useTheme } from '../theme';
import FormRenderer from './FormRenderer';
import type { FormModel } from '../utils/form/FormModel';
import type { LayoutConfig } from '../types/layout';

interface FormContainerProps {
  formModel: FormModel;
  onSubmit?: (data: Record<string, unknown>) => void;
  layoutConfig?: LayoutConfig;
}

const FormContainer: React.FC<FormContainerProps> = ({ formModel, onSubmit, layoutConfig }) => {
  const { theme } = useTheme();
  const { colors, components, shadows, layout } = theme;

  const handleMouseEnter = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      target.style.borderColor = colors.primary[500];
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      target.style.borderColor = colors.border.primary;
    }
  };

  const handleFocus = (e: React.FocusEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      target.style.borderColor = colors.primary[500];
      target.style.boxShadow = `0 0 0 2px ${shadows.focus}`;
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      target.style.borderColor = colors.border.primary;
      target.style.boxShadow = 'none';
    }
  };

  return (
    <div
      style={{
      border: `1px solid ${colors.border.primary}`,
      borderRadius: components.field.input.borderRadius,
      padding: layout.form.padding,
      maxWidth: layout.form.maxWidth,
      margin: '0 auto',
      backgroundColor: colors.background.primary
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <FormRenderer formModel={formModel} onSubmit={onSubmit} layoutConfig={layoutConfig} />
    </div>
  );
};

export default FormContainer;
