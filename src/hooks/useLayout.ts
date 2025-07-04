import { useState, useEffect, useMemo } from 'react';
import type { LayoutConfig, ResponsiveBreakpoint } from '../types/layout';
import { DEFAULT_FIELD_WIDTHS } from '../types/layout';
import { getCurrentBreakpoint } from '../utils/layout/layoutUtils';

/**
 * Hook to manage responsive layout state and breakpoint detection
 */
export const useResponsiveBreakpoint = (): ResponsiveBreakpoint => {
  const [breakpoint, setBreakpoint] = useState<ResponsiveBreakpoint>(() => {
    if (typeof window === 'undefined') return 'desktop';
    return getCurrentBreakpoint(window.innerWidth);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const newBreakpoint = getCurrentBreakpoint(window.innerWidth);
      if (newBreakpoint !== breakpoint) {
        setBreakpoint(newBreakpoint);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return breakpoint;
};

/**
 * Hook to resolve layout configuration based on current breakpoint
 */
export const useLayoutConfig = (
  baseConfig: LayoutConfig,
  breakpoint: ResponsiveBreakpoint
): LayoutConfig => {
  return useMemo(() => {
    // If responsive-adaptive strategy, determine actual strategy based on breakpoint
    if (baseConfig.strategy === 'responsive-adaptive') {
      const breakpointStrategy = baseConfig.breakpoints?.[breakpoint];
      if (breakpointStrategy) {
        return {
          ...baseConfig,
          strategy: breakpointStrategy
        };
      }
      
      // Default responsive behavior
      switch (breakpoint) {
        case 'mobile':
          return { ...baseConfig, strategy: 'vertical' };
        case 'tablet':
          return { ...baseConfig, strategy: 'intelligent-flow' };
        case 'desktop':
          return { ...baseConfig, strategy: 'grid-12' };
        default:
          return { ...baseConfig, strategy: 'vertical' };
      }
    }

    return baseConfig;
  }, [baseConfig, breakpoint]);
};

/**
 * Hook to manage layout state and provide layout utilities
 */
export const useLayout = (initialConfig: LayoutConfig = { strategy: 'vertical' }) => {
  const breakpoint = useResponsiveBreakpoint();
  const layoutConfig = useLayoutConfig(initialConfig, breakpoint);

  // Merge default field widths with any custom widths
  const mergedFieldWidths = {
    ...DEFAULT_FIELD_WIDTHS,
    ...layoutConfig.fieldWidths
  };

  const isVertical = layoutConfig.strategy === 'vertical';
  const isGrid = layoutConfig.strategy === 'grid-12' || layoutConfig.strategy === 'grid-custom';
  const isFlow = layoutConfig.strategy === 'intelligent-flow';
  const isResponsive = initialConfig.strategy === 'responsive-adaptive';

  return {
    breakpoint,
    layoutConfig: {
      ...layoutConfig,
      fieldWidths: mergedFieldWidths
    },
    isVertical,
    isGrid,
    isFlow,
    isResponsive,
  };
};
