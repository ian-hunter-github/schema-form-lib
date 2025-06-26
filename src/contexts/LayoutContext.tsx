import React, { createContext, useContext } from 'react';
import type { LayoutStrategy } from '../types/layout';

interface LayoutContextValue {
  strategy: LayoutStrategy;
  isGrid12: boolean;
  debug?: boolean;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

interface LayoutProviderProps {
  strategy: LayoutStrategy;
  debug?: boolean;
  children: React.ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({
  strategy,
  debug = false,
  children
}) => {
  const value: LayoutContextValue = {
    strategy,
    isGrid12: strategy === 'grid-12',
    debug
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutContext = (): LayoutContextValue => {
  const context = useContext(LayoutContext);
  if (!context) {
    // Default fallback when not in a layout context
    return {
      strategy: 'vertical',
      isGrid12: false,
      debug: false
    };
  }
  return context;
};
