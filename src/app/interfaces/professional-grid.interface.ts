/**
 * Professional Grid System Interfaces (Shopify-style)
 * Full responsive grid control with mobile-first approach
 */

/**
 * Generic responsive value type
 */
export interface Responsive<T> {
  base?: T;  // Mobile (default)
  md?: T;    // Tablet (≥768px)
  lg?: T;    // Desktop (≥1024px)
  xl?: T;    // Large Desktop (≥1280px)
}

/**
 * Grid item configuration for individual collection items
 */
export interface IGridItemConfig {
  colSpan?: Responsive<number>;
  rowSpan?: Responsive<number>;
  customClass?: string;
}

/**
 * Professional Grid Configuration
 */
export interface IProfessionalGridConfig {
  columns?: Responsive<number>;
  rows?: Responsive<number>;
  rowHeight?: Responsive<string>;
  gap?: number;
  items?: IGridItemConfig[];
  wrapperClass?: string;
  justifyContent?: 'center' | 'start' | 'end' | 'between' | 'around' | 'evenly';
  alignItems?: 'center' | 'start' | 'end' | 'stretch';
  maxWidth?: string; // مثل '1440px', '1200px', 'none'
}

/**
 * Grid preset templates (Shopify-style)
 */
export interface IGridPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  config: IProfessionalGridConfig;
  preview: string; // SVG or image URL
}

/**
 * Grid validation result
 */
export interface IGridValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Breakpoint configuration
 */
export interface IBreakpoint {
  name: 'base' | 'md' | 'lg' | 'xl';
  label: string;
  icon: string;
  minWidth: string;
  active: boolean;
}








