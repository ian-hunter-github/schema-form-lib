import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '../theme/ThemeProvider';
import { LayoutProvider } from '../contexts/LayoutContext';
import type { LayoutStrategy } from '../types/layout';

interface TestWrapperProps {
  children: React.ReactNode;
  layoutStrategy?: LayoutStrategy;
  debug?: boolean;
}

const TestWrapper: React.FC<TestWrapperProps> = ({ 
  children, 
  layoutStrategy = 'vertical',
  debug = false 
}) => {
  return (
    <ThemeProvider>
      <LayoutProvider strategy={layoutStrategy} debug={debug}>
        {children}
      </LayoutProvider>
    </ThemeProvider>
  );
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  layoutStrategy?: LayoutStrategy;
  debug?: boolean;
}

const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { layoutStrategy = 'vertical', debug = false, ...renderOptions } = options;
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestWrapper layoutStrategy={layoutStrategy} debug={debug}>
      {children}
    </TestWrapper>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Export the wrapper for manual use
export { TestWrapper };
