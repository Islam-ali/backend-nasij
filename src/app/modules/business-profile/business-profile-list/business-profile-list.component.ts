import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';

// PrimeNG Services
import { MessageService } from 'primeng/api';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AccordionModule } from 'primeng/accordion';
import { DividerModule } from 'primeng/divider';
import { EditorModule } from 'primeng/editor';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TooltipModule } from 'primeng/tooltip';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TabViewModule } from 'primeng/tabview';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DropdownModule } from 'primeng/dropdown';

import { IBusinessProfile } from '../../../interfaces/business-profile.interface';
import { BusinessProfileService } from '../../../services/business-profile.service';
import { ComponentBase } from '../../../core/directives/component-base.directive';
import { finalize, takeUntil } from 'rxjs';
import { BaseResponse } from '../../../core/models/baseResponse';
import { FallbackImgDirective } from '../../../core/directives/fallback-img.directive';
import { UploadFilesComponent } from '../../../shared/components/fields/upload-files/upload-files.component';
import { SafePipe } from '../../../core/pipes/safe.pipe';
import { environment } from '../../../../environments/environment';
import { HeaderAlignment } from '../../../interfaces/product-feature.interface';

@Component({
  selector: 'app-business-profile-list',
  standalone: true,
      imports: [
      CommonModule,
      ReactiveFormsModule,
      FormsModule,
      ToastModule,
      ButtonModule,
      InputTextModule,
      TextareaModule,
      CardModule,
      FileUploadModule,
      ProgressSpinnerModule,
      AccordionModule,
      DividerModule,
      EditorModule,
      ToggleButtonModule,
      TooltipModule,
      ColorPickerModule,
      ConfirmDialogModule,
      BadgeModule,
      ChipModule,
      MessagesModule,
      MessageModule,
      SkeletonModule,
      InputGroupModule,
      InputGroupAddonModule,
      TabViewModule,
      SelectButtonModule,
      DropdownModule,
      UploadFilesComponent,
      SafePipe
    ],
  templateUrl: './business-profile-list.component.html',
  styleUrls: ['./business-profile-list.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class BusinessProfileListComponent extends ComponentBase implements OnInit {
  businessProfileForm!: FormGroup;
  loading = signal(false);
  saving = signal(false);
  businessProfile: IBusinessProfile | null = null;
  logoDarkPreview: string | null = null;
  logoLightPreview: string | null = null;
  isEditMode = signal(false);
  showEditor = signal(false);
  hasUnsavedChanges = signal(false);
  formProgress = signal(0);
  
  scriptPositionOptions = [
    { label: 'Head', value: 'head', icon: 'pi pi-angle-up' },
    { label: 'Body', value: 'body', icon: 'pi pi-angle-down' }
  ];

  headerAlignmentOptions = [
    { label: 'Start', value: HeaderAlignment.START },
    { label: 'Center', value: HeaderAlignment.CENTER },
    { label: 'End', value: HeaderAlignment.END },
  ];

  constructor(
    private fb: FormBuilder,
    private businessProfileService: BusinessProfileService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    super();
  }

  ngOnInit() {
    this.initForm();
    this.loadBusinessProfile();
    
    // Subscribe to logo changes to update preview
    this.logoDarkControl.valueChanges.subscribe(value => {
      if (value && value.filePath) {
        this.logoDarkPreview = value.filePath;
      } else {
        this.logoDarkPreview = null;
      }
    });

    this.logoLightControl.valueChanges.subscribe(value => {
      if (value && value.filePath) {
        this.logoLightPreview = value.filePath;
      } else {
        this.logoLightPreview = null;
      }
    });

    // Track form changes for unsaved changes warning
    this.businessProfileForm.valueChanges.subscribe(() => {
      if (this.isEditMode()) {
        this.hasUnsavedChanges.set(true);
        this.calculateFormProgress();
      }
    });
  }

  getImageUrl(filePath: string): string {
    return `${environment.baseUrl}/${filePath}`;
  }

  initForm() {
    this.businessProfileForm = this.fb.group({
      name: this.fb.group({
        en: ['', [Validators.required, Validators.minLength(2)]],
        ar: ['', [Validators.required, Validators.minLength(2)]]
      }),
      description: this.fb.group({
        en: ['', [Validators.required, Validators.minLength(10)]],
        ar: ['', [Validators.required, Validators.minLength(10)]]
      }),
      logo_dark: [null],
      logo_light: [null],
      socialMedia: this.fb.group({
        facebook: [''],
        instagram: [''],
        twitter: [''],
        linkedin: [''],
        tiktok: ['']
      }),
      contactInfo: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required]],
        address: this.fb.group({
          en: ['', [Validators.required]],
          ar: ['', [Validators.required]]
        }),
        mapLocation: ['']
      }),
      vodafoneCashAccount: [''],
      paymobSettings: this.fb.group({
        enabled: [false],
        apiKey: [''],
        integrationId: [''],
        walletIntegrationId: [''],
        iframeId: [''],
        hmacSecret: [''],
        callbackUrl: [''],
        webhookUrl: [''],
        responseCallbackUrl: ['']
      }),
      privacyPolicy: this.fb.group({
        en: [''],
        ar: ['']
      }),
      termsOfService: this.fb.group({
        en: [''],
        ar: ['']
      }),
      primaryColor: ['#3B82F6'],
      headerAlignment: [HeaderAlignment.CENTER],
      faq: this.fb.array([]),
      metaTitle: this.fb.group({
        en: [''],
        ar: ['']
      }),
      metaDescription: this.fb.group({
        en: [''],
        ar: ['']
      }),
      metaKeywords: [''],
      metaTags: [''],
      scripts: this.fb.array([]),
      siteName: this.fb.group({
        en: [''],
        ar: ['']
      }),
      baseUrl: [''],
      canonicalUrl: ['']
    });
  }

  get faqArray(): FormArray {
    return this.businessProfileForm.get('faq') as FormArray;
  }

  get scriptsArray(): FormArray {
    return this.businessProfileForm.get('scripts') as FormArray;
  }

  get logoDarkControl(): FormControl {
    return this.businessProfileForm.get('logo_dark') as FormControl;
  }

  get logoLightControl(): FormControl {
    return this.businessProfileForm.get('logo_light') as FormControl;
  }

  addFAQ() {
    const faqGroup = this.fb.group({
      question: this.fb.group({
        en: ['', [Validators.required]],
        ar: ['', [Validators.required]]
      }),
      answer: this.fb.group({
        en: ['', [Validators.required]],
        ar: ['', [Validators.required]]
      })
    });
    this.faqArray.push(faqGroup);
  }

  removeFAQ(index: number) {
    this.faqArray.removeAt(index);
  }

  clearAllFAQ() {
    this.faqArray.clear();
  }

  moveFAQ(index: number, direction: 'up' | 'down') {
    const currentIndex = index;
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < this.faqArray.length) {
      const currentGroup = this.faqArray.at(currentIndex);
      const targetGroup = this.faqArray.at(newIndex);
      
      // Swap the form groups
      this.faqArray.setControl(currentIndex, targetGroup);
      this.faqArray.setControl(newIndex, currentGroup);
    }
  }


  addScript() {
    const scriptGroup = this.fb.group({
      position: ['head', [Validators.required]],
      script: ['', [Validators.required]]
    });
    this.scriptsArray.push(scriptGroup);
  }

  removeScript(index: number) {
    this.scriptsArray.removeAt(index);
  }

  getKeywordsArray(): string[] {
    const value = this.businessProfileForm.get('metaKeywords')?.value || '';
    if (typeof value === 'string') {
      return value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    }
    return Array.isArray(value) ? value : [];
  }

  removeKeyword(index: number): void {
    const keywordsArray = this.getKeywordsArray();
    keywordsArray.splice(index, 1);
    this.businessProfileForm.patchValue({
      metaKeywords: keywordsArray.join(', ')
    });
  }

  loadBusinessProfile() {
    this.loading.set(true);
    this.businessProfileService.getLatestBusinessProfile()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response: BaseResponse<IBusinessProfile>) => {
          if (response.data) {
            this.businessProfile = response.data;
            this.populateForm(response.data);
            if (response.data.logo_dark) {
              this.logoDarkPreview = response.data.logo_dark.filePath;
            }
            if (response.data.logo_light) {
              this.logoLightPreview = response.data.logo_light.filePath;
            }
          }
        },
        error: (error) => {
          console.error('Error loading business profile:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load business profile'
          });
        }
      });
  }

  private populateForm(profile: IBusinessProfile) {
    this.businessProfileForm.patchValue({
      name: profile.name,
      description: profile.description,
      logo_dark: profile.logo_dark,
      logo_light: profile.logo_light,
      socialMedia: profile.socialMedia,
      contactInfo: {
        email: profile.contactInfo.email,
        phone: profile.contactInfo.phone,
        address: profile.contactInfo.address,
        mapLocation: profile.contactInfo.mapLocation
      },
      vodafoneCashAccount: profile.vodafoneCashAccount,
      paymobSettings: profile.paymobSettings || {
        enabled: false,
        apiKey: '',
        integrationId: '',
        walletIntegrationId: '',
        iframeId: '',
        hmacSecret: '',
        callbackUrl: '',
        webhookUrl: '',
        responseCallbackUrl: ''
      },
      privacyPolicy: {
        en: profile.privacyPolicy.en,
        ar: profile.privacyPolicy.ar
      },
      termsOfService: {
        en: profile.termsOfService.en,
        ar: profile.termsOfService.ar
      },
      primaryColor: profile.primaryColor || '#3B82F6',
      headerAlignment: profile.headerAlignment || HeaderAlignment.CENTER,
      faq: profile.faq,
      metaTitle: profile.metaTitle || { en: '', ar: '' },
      metaDescription: profile.metaDescription || { en: '', ar: '' },
      metaKeywords: Array.isArray(profile.metaKeywords) ? profile.metaKeywords.join(', ') : (profile.metaKeywords || ''),
      metaTags: profile.metaTags || '',
      siteName: profile.siteName || { en: '', ar: '' },
      baseUrl: profile.baseUrl || '',
      canonicalUrl: profile.canonicalUrl || ''
    });

    // Update logo control
    this.logoDarkControl.setValue(profile.logo_dark);
    this.logoLightControl.setValue(profile.logo_light);

    // Populate FAQ array
    this.faqArray.clear();
    if (profile.faq) {
      profile.faq.forEach(faq => {
        const faqGroup = this.fb.group({
          question: this.fb.group({
            en: [faq.question.en, [Validators.required]],
            ar: [faq.question.ar, [Validators.required]]
          }),
          answer: this.fb.group({
            en: [faq.answer.en, [Validators.required]],
            ar: [faq.answer.ar, [Validators.required]]
          })
        });
        this.faqArray.push(faqGroup);
      });
    }


    // Populate Scripts array
    this.scriptsArray.clear();
    if (profile.scripts) {
      profile.scripts.forEach(script => {
        const scriptGroup = this.fb.group({
          position: [script.position || 'head', [Validators.required]],
          script: [script.script, [Validators.required]]
        });
        this.scriptsArray.push(scriptGroup);
      });
    }
  }

  toggleEditMode() {
    if (this.isEditMode() && this.hasUnsavedChanges()) {
      // Confirm before canceling with unsaved changes
      this.confirmationService.confirm({
        message: 'You have unsaved changes. Are you sure you want to cancel?',
        header: 'Unsaved Changes',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.cancelEdit();
        }
      });
    } else {
      this.isEditMode.set(!this.isEditMode());
      if (this.isEditMode()) {
        // Update logo control when entering edit mode
        this.logoDarkControl.setValue(this.businessProfileForm.get('logo_dark')?.value);
        this.logoLightControl.setValue(this.businessProfileForm.get('logo_light')?.value);
        this.hasUnsavedChanges.set(false);
      }
    }
  }

  private cancelEdit() {
    this.isEditMode.set(false);
    this.hasUnsavedChanges.set(false);
    if (this.businessProfile) {
      this.populateForm(this.businessProfile);
    }
  }

  toggleEditor() {
    this.showEditor.set(!this.showEditor());
  }

  saveBusinessProfile() {
    // Check for critical fields only (not all required fields)
    const criticalFields = [
      'name.en',
      'name.ar',
      'contactInfo.email',
      'contactInfo.phone'
    ];

    const hasInvalidCriticalFields = criticalFields.some(field => {
      const control = this.businessProfileForm.get(field);
      return control?.invalid;
    });

    if (hasInvalidCriticalFields) {
      this.markFormGroupTouched(this.businessProfileForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Missing Critical Information',
        detail: 'Please fill in at least: Business Name (EN & AR), Email, and Phone',
        life: 5000
      });
      this.scrollToFirstError();
      return;
    }

    // Show warning if form has other invalid fields but allow saving
    if (this.businessProfileForm.invalid) {
      this.messageService.add({
        severity: 'info',
        summary: 'Incomplete Information',
        detail: 'Some optional fields are incomplete. You can complete them later.',
        life: 3000
      });
    }

    this.saving.set(true);
    const formData = { ...this.businessProfileForm.value };
    
    // Convert metaKeywords from string to array
    if (formData.metaKeywords && typeof formData.metaKeywords === 'string') {
      formData.metaKeywords = formData.metaKeywords
        .split(',')
        .map((k: string) => k.trim())
        .filter((k: string) => k.length > 0);
    }
    
    // metaTags is now a string, no cleaning needed
    // Just trim if it exists
    if (formData.metaTags && typeof formData.metaTags === 'string') {
      formData.metaTags = formData.metaTags.trim() || undefined;
    }
    
    // Logo is already a single object when multiple = false

    if (this.businessProfile) {
      // Update existing profile
      this.businessProfileService.updateBusinessProfile(this.businessProfile._id, formData)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.saving.set(false))
        )
        .subscribe({
          next: (response: BaseResponse<IBusinessProfile>) => {
            this.businessProfile = response.data;
            this.isEditMode.set(false);
            this.hasUnsavedChanges.set(false);
            // Update logo control with new data
            this.logoDarkControl.setValue(response.data.logo_dark);
            this.logoLightControl.setValue(response.data.logo_light);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Business Profile Updated Successfully',
              life: 3000
            });
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
          error: (error) => {
            console.error('Error updating business profile:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update business profile'
            });
          }
        });
    } else {
      // Create new profile
      this.businessProfileService.createBusinessProfile(formData)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.saving.set(false))
        )
        .subscribe({
          next: (response: BaseResponse<IBusinessProfile>) => {
            this.businessProfile = response.data;
            this.isEditMode.set(false);
            this.hasUnsavedChanges.set(false);
            // Update logo control with new data
            this.logoDarkControl.setValue(response.data.logo_dark);
            this.logoLightControl.setValue(response.data.logo_light);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Business Profile Created Successfully',
              life: 3000
            });
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
          error: (error) => {
            console.error('Error creating business profile:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create business profile'
            });
          }
        });
    }
  }



  getFieldError(fieldName: string, language?: string): string {
    const fieldPath = language ? `${fieldName}.${language}` : fieldName;
    const field = this.businessProfileForm.get(fieldPath);
    if (field?.invalid && (field?.touched || field?.dirty)) {
      if (field.errors?.['required']) {
        return `This field is required`;
      }
      if (field.errors?.['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors?.['minlength']) {
        const required = field.errors['minlength'].requiredLength;
        const actual = field.errors['minlength'].actualLength;
        return `Minimum ${required} characters required (current: ${actual})`;
      }
      if (field.errors?.['maxlength']) {
        return `Maximum ${field.errors['maxlength'].requiredLength} characters allowed`;
      }
      if (field.errors?.['pattern']) {
        return 'Invalid format';
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string, language?: string): boolean {
    const fieldPath = language ? `${fieldName}.${language}` : fieldName;
    const field = this.businessProfileForm.get(fieldPath);
    return !!(field?.invalid && (field?.touched || field?.dirty));
  }

  isFieldValid(fieldName: string, language?: string): boolean {
    const fieldPath = language ? `${fieldName}.${language}` : fieldName;
    const field = this.businessProfileForm.get(fieldPath);
    return !!(field?.valid && (field?.touched || field?.dirty));
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      control?.markAsDirty();

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private scrollToFirstError() {
    const firstError = document.querySelector('.ng-invalid:not(form)');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (firstError as HTMLElement).focus();
    }
  }

  private calculateFormProgress() {
    const totalFields = this.getTotalRequiredFields();
    const validFields = this.getValidRequiredFields();
    this.formProgress.set(Math.round((validFields / totalFields) * 100));
  }

  private getTotalRequiredFields(): number {
    // Count important fields (not all required, but important for progress)
    let count = 0;
    count += 2; // name.en, name.ar
    count += 2; // description.en, description.ar
    count += 2; // contactInfo.email, phone
    count += 2; // contactInfo.address.en, ar
    count += 1; // primaryColor
    count += 1; // logo (at least one)
    return count;
  }

  private getValidRequiredFields(): number {
    let count = 0;
    const checkField = (path: string) => {
      const field = this.businessProfileForm.get(path);
      if (field?.valid && field?.value) count++;
    };

    checkField('name.en');
    checkField('name.ar');
    checkField('description.en');
    checkField('description.ar');
    checkField('contactInfo.email');
    checkField('contactInfo.phone');
    checkField('contactInfo.address.en');
    checkField('contactInfo.address.ar');
    checkField('primaryColor');
    
    // Check if at least one logo exists
    if (this.businessProfileForm.get('logo_dark')?.value || 
        this.businessProfileForm.get('logo_light')?.value) {
      count++;
    }

    return count;
  }

  getSectionProgress(section: string): number {
    let total = 0;
    let valid = 0;

    const checkField = (path: string) => {
      total++;
      const field = this.businessProfileForm.get(path);
      if (field?.valid) valid++;
    };

    switch (section) {
      case 'basic':
        checkField('name.en');
        checkField('name.ar');
        checkField('description.en');
        checkField('description.ar');
        break;
      case 'contact':
        checkField('contactInfo.email');
        checkField('contactInfo.phone');
        checkField('contactInfo.address.en');
        checkField('contactInfo.address.ar');
        break;
      case 'branding':
        total = 1;
        if (this.businessProfileForm.get('primaryColor')?.valid) valid++;
        break;
      case 'legal':
        // Optional section, show 100% if any content exists
        const privacyEn = this.businessProfileForm.get('privacyPolicy.en')?.value;
        const privacyAr = this.businessProfileForm.get('privacyPolicy.ar')?.value;
        const termsEn = this.businessProfileForm.get('termsOfService.en')?.value;
        const termsAr = this.businessProfileForm.get('termsOfService.ar')?.value;
        
        if (privacyEn || privacyAr || termsEn || termsAr) {
          return 50; // Partial completion
        }
        if (privacyEn && privacyAr && termsEn && termsAr) {
          return 100; // Full completion
        }
        return 0;
    }

    return total > 0 ? Math.round((valid / total) * 100) : 0;
  }

  hasSocialMedia(): boolean {
    if (!this.businessProfile?.socialMedia) return false;
    const social = this.businessProfile.socialMedia;
    return !!(social.facebook || social.instagram || social.twitter || social.linkedin || social.tiktok);
  }

  getSocialMediaLinks(): Array<{ platform: string; url: string; icon: string; color: string }> {
    if (!this.businessProfile?.socialMedia) return [];
    
    const social = this.businessProfile.socialMedia;
    const links = [];
    
    if (social.facebook) {
      links.push({ platform: 'Facebook', url: social.facebook, icon: 'pi pi-facebook', color: 'bg-blue-600' });
    }
    if (social.instagram) {
      links.push({ platform: 'Instagram', url: social.instagram, icon: 'pi pi-instagram', color: 'bg-pink-600' });
    }
    if (social.twitter) {
      links.push({ platform: 'Twitter', url: social.twitter, icon: 'pi pi-twitter', color: 'bg-blue-400' });
    }
    if (social.linkedin) {
      links.push({ platform: 'LinkedIn', url: social.linkedin, icon: 'pi pi-linkedin', color: 'bg-blue-700' });
    }
    if (social.tiktok) {
      links.push({ platform: 'TikTok', url: social.tiktok, icon: 'pi pi-video', color: 'bg-black' });
    }
    
    return links;
  }

  adjustColorBrightness(hex: string, percent: number): string {
    // Remove the # if present
    hex = hex.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate new values
    const newR = Math.max(0, Math.min(255, r + (r * percent / 100)));
    const newG = Math.max(0, Math.min(255, g + (g * percent / 100)));
    const newB = Math.max(0, Math.min(255, b + (b * percent / 100)));
    
    // Convert back to hex
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  }

  /**
   * Generate specific shade of a color (50-900)
   */
  generateShade(baseColor: string, shade: number): string {
    const rgb = this.hexToRgb(baseColor);
    if (!rgb) return baseColor;
    
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Map shade to lightness value
    const shadeMap: Record<number, number> = {
      50: 0.95,
      100: 0.90,
      200: 0.80,
      300: 0.70,
      400: 0.60,
      500: hsl.l,
      600: hsl.l - 0.10,
      700: hsl.l - 0.20,
      800: hsl.l - 0.30,
      900: hsl.l - 0.40,
    };
    
    const lightness = Math.max(0.05, Math.min(0.95, shadeMap[shade] || hsl.l));
    return this.hslToHex(hsl.h, hsl.s, lightness);
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return { h, s, l };
  }

  private hslToHex(h: number, s: number, l: number): string {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  getHeaderAlignmentLabel(alignment?: HeaderAlignment): string {
    if (!alignment) return 'Center';
    const option = this.headerAlignmentOptions.find(opt => opt.value === alignment);
    return option?.label || 'Center';
  }
} 