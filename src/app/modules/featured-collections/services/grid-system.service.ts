import { Injectable } from '@angular/core';

export interface GridConfig {
  columns: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  gap: number;
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  width?: string;
  parentCustomClasses?: string;
}

/**
 * GridSystemService
 * 
 * Service for managing dynamic CSS Grid configurations
 * and generating Tailwind classes
 */
@Injectable({
  providedIn: 'root'
})
export class GridSystemService {
  /**
   * Generate CSS Grid classes from config
   */
  generateGridClasses(config: GridConfig): string {
    const classes: string[] = ['grid'];

    // Column classes
    classes.push(`grid-cols-${config.columns.sm}`);
    classes.push(`md:grid-cols-${config.columns.md}`);
    classes.push(`lg:grid-cols-${config.columns.lg}`);
    classes.push(`xl:grid-cols-${config.columns.xl}`);

    // Gap
    const gapClass = this.getGapClass(config.gap);
    if (gapClass) classes.push(gapClass);

    // Justify content
    if (config.justifyContent) {
      classes.push(`justify-${config.justifyContent}`);
    }

    // Align items
    if (config.alignItems) {
      classes.push(`items-${config.alignItems}`);
    }

    // Parent custom classes
    if (config.parentCustomClasses) {
      classes.push(config.parentCustomClasses);
    }

    return classes.join(' ');
  }

  /**
   * Generate inline styles for grid container
   */
  generateGridStyles(config: GridConfig): { [key: string]: string } {
    const styles: { [key: string]: string } = {};

    if (config.width) {
      styles.width = config.width;
    }

    return styles;
  }

  /**
   * Generate item classes based on colSpan
   */
  generateItemClasses(colSpan: { sm: number; md: number; lg: number; xl: number }, customClasses?: string): string {
    const classes: string[] = [];

    // Col span classes
    if (colSpan.sm > 1) classes.push(`col-span-${colSpan.sm}`);
    if (colSpan.md !== colSpan.sm) classes.push(`md:col-span-${colSpan.md}`);
    if (colSpan.lg !== colSpan.md) classes.push(`lg:col-span-${colSpan.lg}`);
    if (colSpan.xl !== colSpan.lg) classes.push(`xl:col-span-${colSpan.xl}`);

    // Custom classes
    if (customClasses) {
      classes.push(customClasses);
    }

    return classes.join(' ');
  }

  /**
   * Get current breakpoint based on window width
   */
  getCurrentBreakpoint(): 'sm' | 'md' | 'lg' | 'xl' {
    const width = window.innerWidth;

    if (width >= 1280) return 'xl';
    if (width >= 1024) return 'lg';
    if (width >= 768) return 'md';
    return 'sm';
  }

  /**
   * Convert gap (rem) to Tailwind class
   */
  private getGapClass(gap: number): string {
    const gapMap: { [key: number]: string } = {
      0: 'gap-0',
      0.25: 'gap-1',
      0.5: 'gap-2',
      0.75: 'gap-3',
      1: 'gap-4',
      1.25: 'gap-5',
      1.5: 'gap-6',
      2: 'gap-8',
      2.5: 'gap-10',
      3: 'gap-12',
      4: 'gap-16'
    };

    return gapMap[gap] || `gap-[${gap}rem]`;
  }
}





