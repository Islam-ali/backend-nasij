import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

/**
 * Collection Form Model
 * 
 * Production-ready FormArray structure for Featured Collections
 * with full TypeScript typing and validation
 */

export interface CollectionFormValue {
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  image: any;
  buttonText: {
    en: string;
    ar: string;
  };
  buttonLink: string;
  colSpan: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  height?: number | string;
  itemCustomClasses?: string;
}

export class CollectionFormModel {
  private fb: FormBuilder;

  constructor(fb: FormBuilder) {
    this.fb = fb;
  }

  /**
   * Create a single collection FormGroup
   */
  createCollectionFormGroup(data?: Partial<CollectionFormValue>): FormGroup {
    return this.fb.group({
      title: this.fb.group({
        en: [data?.title?.en || '', [Validators.required]],
        ar: [data?.title?.ar || '', [Validators.required]]
      }),
      description: this.fb.group({
        en: [data?.description?.en || '', [Validators.required]],
        ar: [data?.description?.ar || '', [Validators.required]]
      }),
      image: [data?.image || null, [Validators.required]],
      buttonText: this.fb.group({
        en: [data?.buttonText?.en || '', [Validators.required]],
        ar: [data?.buttonText?.ar || '', [Validators.required]]
      }),
      buttonLink: [data?.buttonLink || '', [Validators.required]],
      colSpan: this.fb.group({
        sm: [data?.colSpan?.sm || 1, [Validators.required, Validators.min(1), Validators.max(12)]],
        md: [data?.colSpan?.md || 2, [Validators.required, Validators.min(1), Validators.max(12)]],
        lg: [data?.colSpan?.lg || 2, [Validators.required, Validators.min(1), Validators.max(12)]],
        xl: [data?.colSpan?.xl || 2, [Validators.required, Validators.min(1), Validators.max(12)]]
      }),
      height: [data?.height || null],
      itemCustomClasses: [data?.itemCustomClasses || '']
    });
  }

  /**
   * Get colSpan FormGroup from collection FormGroup
   */
  getColSpanGroup(collectionGroup: FormGroup): FormGroup {
    return collectionGroup.get('colSpan') as FormGroup;
  }

  /**
   * Get height FormControl from collection FormGroup
   */
  getHeightControl(collectionGroup: FormGroup): FormControl {
    return collectionGroup.get('height') as FormControl;
  }

  /**
   * Serialize FormArray to API format
   */
  serializeToAPI(collectionsArray: FormArray): any[] {
    return collectionsArray.controls.map(control => {
      const value = control.value;
      return {
        title: value.title,
        description: value.description,
        image: value.image,
        buttonText: value.buttonText,
        buttonLink: value.buttonLink,
        colSpan: value.colSpan,
        height: value.height || undefined,
        itemCustomClasses: value.itemCustomClasses || undefined
      };
    });
  }

  /**
   * Deserialize API data to FormArray
   */
  deserializeFromAPI(collectionsArray: FormArray, data: any[]): void {
    // Clear existing
    while (collectionsArray.length > 0) {
      collectionsArray.removeAt(0);
    }

    // Add from API
    data.forEach(item => {
      collectionsArray.push(this.createCollectionFormGroup({
        title: item.title,
        description: item.description,
        image: item.image,
        buttonText: item.buttonText,
        buttonLink: item.buttonLink,
        colSpan: item.colSpan || { sm: 1, md: 2, lg: 2, xl: 2 },
        height: item.height,
        itemCustomClasses: item.itemCustomClasses
      }));
    });
  }

  /**
   * Validate entire FormArray
   */
  validateCollections(collectionsArray: FormArray): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    collectionsArray.controls.forEach((control, index) => {
      if (control.invalid) {
        errors.push(`Collection ${index + 1} has validation errors`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}





