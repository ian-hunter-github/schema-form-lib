import React from 'react';
import type { FormField } from '../../types/fields';
import type { FormModel } from '../../utils/form/FormModel';
import type { LayoutConfig, FieldLayoutConfig } from '../../types/layout';
import type { JSONValue } from '../../types/schema';
import { useLayout } from '../../hooks/useLayout';
import { useTheme } from '../../theme/ThemeProvider';
import { 
  groupFieldsIntoRows, 
  getLayoutGap,
  calculateFieldWidth,
  getResponsiveColumns,
  adjustRowFieldWidths
} from '../../utils/layout/layoutUtils';
import { LayoutProvider } from '../../contexts/LayoutContext';
import FieldRenderer from '../FieldRenderer';

interface LayoutContainerProps {
  fields: FormField[];
  formModel: FormModel;
  layoutConfig: LayoutConfig;
  onChange: (path: string, value: JSONValue) => void;
  className?: string;
  /** Whether to show field descriptions (default: true) */
  showDescriptions?: boolean;
  /** Current nesting depth for nested fields */
  nestingDepth: number;
}

const LayoutContainer: React.FC<LayoutContainerProps> = ({
  fields,
  formModel,
  layoutConfig: propConfig = {},
  onChange,
  className = '',
  showDescriptions = true,
  nestingDepth
}) => {
  const { theme } = useTheme();
  
  // Merge theme layout with prop config (props take precedence)
  const mergedConfig = {
    ...theme.layout,
    ...propConfig,
    breakpoints: {
      ...theme.layout?.breakpoints,
      ...propConfig.breakpoints
    },
    fieldWidths: {
      ...theme.layout?.fieldWidths,
      ...propConfig.fieldWidths
    }
  };

  const { breakpoint, layoutConfig: resolvedConfig, isVertical, isGrid, isFlow } = useLayout(mergedConfig);
  
  const gap = getLayoutGap(resolvedConfig.gap);
  
  // Vertical layout - simple stacking
  if (isVertical) {
    return (
      <div 
        className={`layout-vertical ${className}`}
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap 
        }}
      >
        {fields.map((field) => (
          <div key={field.path} className="field-wrapper">
              <FieldRenderer
                field={field}
                formModel={formModel}
                onChange={(value) => onChange(field.path, value)}
                showDescriptions={showDescriptions}
                nestingDepth={nestingDepth}
              />
          </div>
        ))}
      </div>
    );
  }
  
  // Grid layouts (grid-12 and grid-custom)
  if (isGrid) {
    const debugClass = resolvedConfig.debug ? 'layout-debug' : '';
    const gapClass = `layout-gap-${resolvedConfig.gap || 'md'}`;
    const rows = groupFieldsIntoRows(fields, resolvedConfig, breakpoint);
    
    return (
      <LayoutProvider strategy={resolvedConfig.strategy} debug={resolvedConfig.debug}>
      <div 
        data-testid="layout-container"
        className={`layout-grid layout-grid-12 ${gapClass} ${debugClass} ${className}`}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap,
          width: '100%'
        }}
      >
          {rows.map((row) => {
            // Adjust field widths to fill remaining space (no gaps on the right)
            const adjustedFields = adjustRowFieldWidths(row, breakpoint);
            
            return adjustedFields.map(({ field, adjustedWidth }) => (
              <div 
                key={field.path} 
                className={`field-wrapper field-col-${adjustedWidth}`}
                style={{
                  gridColumn: `span ${adjustedWidth}`,
                  minWidth: 0 // Prevent grid overflow
                }}
              >
                <FieldRenderer
                  field={field}
                  formModel={formModel}
                  onChange={(value) => onChange(field.path, value)}
                  showDescriptions={showDescriptions}
                  nestingDepth={nestingDepth}
                />
              </div>
            ));
          })}
        </div>
      </LayoutProvider>
    );
  }
  
  // Intelligent flow layout
  if (isFlow) {
    const rows = groupFieldsIntoRows(fields, resolvedConfig, breakpoint);
    
    return (
      <div 
        className={`layout-flow ${className}`}
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap 
        }}
      >
        {rows.map((row, rowIndex) => (
          <div 
            key={rowIndex}
            className="layout-row"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap,
              alignItems: 'flex-start'
            }}
          >
            {row.map((field) => {
              const fieldWidth = calculateFieldWidth(field);
              const schema = field.schema as { 'x-layout'?: FieldLayoutConfig };
              const fieldLayout = schema['x-layout'];
              const responsiveWidth = getResponsiveColumns(fieldLayout, breakpoint, fieldWidth);
              
              // Calculate flex basis as percentage of 12-column grid
              const flexBasis = `${(responsiveWidth / 12) * 100}%`;
              
              return (
                <div 
                  key={field.path}
                  className="field-wrapper"
                  data-testid="field-wrapper"
                  style={{
                    flex: `0 0 ${flexBasis}`,
                    minWidth: 0,
                    maxWidth: flexBasis
                  }}
                >
                  <FieldRenderer
                    field={field}
                    formModel={formModel}
                    onChange={(value) => onChange(field.path, value)}
                    nestingDepth={nestingDepth}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }
  
  // Fallback to vertical layout
  return (
    <div 
      data-testid="layout-container"
      className={`layout-fallback ${className}`}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap 
      }}
    >
      {fields.map((field) => (
        <div key={field.path} className="field-wrapper">
                <FieldRenderer
                  field={field}
                  formModel={formModel}
                  onChange={(value) => onChange(field.path, value)}
                  showDescriptions={showDescriptions}
                  nestingDepth={nestingDepth}
                />
        </div>
      ))}
    </div>
  );
};

export default LayoutContainer;
