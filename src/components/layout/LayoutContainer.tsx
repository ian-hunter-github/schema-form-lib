import React from 'react';
import type { FormField } from '../../utils/formModel/types';
import type { FormModel } from '../../utils/formModel/FormModel';
import type { LayoutConfig } from '../../types/layout';
import type { JSONValue } from '../../types/schema';
import { useLayout } from '../../hooks/useLayout';
import { 
  groupFieldsIntoRows, 
  getFieldColumnClass, 
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
}

const LayoutContainer: React.FC<LayoutContainerProps> = ({
  fields,
  formModel,
  layoutConfig,
  onChange,
  className = ''
}) => {
  const { breakpoint, layoutConfig: resolvedConfig, isVertical, isGrid, isFlow } = useLayout(layoutConfig);
  
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
            />
          </div>
        ))}
      </div>
    );
  }
  
  // Grid layouts (grid-12 and grid-custom)
  if (isGrid) {
    const debugClass = resolvedConfig.debug ? 'layout-debug' : '';
    const rows = groupFieldsIntoRows(fields, resolvedConfig, breakpoint);
    
    return (
      <LayoutProvider strategy={resolvedConfig.strategy} debug={resolvedConfig.debug}>
        <div 
          className={`layout-grid layout-grid-12 ${debugClass} ${className}`}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap,
            width: '100%'
          }}
        >
          {rows.map((row, rowIndex) => {
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
              const schema = field.schema as any;
              const fieldLayout = schema['x-layout'];
              const responsiveWidth = getResponsiveColumns(fieldLayout, breakpoint, fieldWidth);
              
              // Calculate flex basis as percentage of 12-column grid
              const flexBasis = `${(responsiveWidth / 12) * 100}%`;
              
              return (
                <div 
                  key={field.path}
                  className="field-wrapper"
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
          />
        </div>
      ))}
    </div>
  );
};

export default LayoutContainer;
