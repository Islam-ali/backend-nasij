import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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

import { IBusinessProfile } from '../../../interfaces/business-profile.interface';
import { BusinessProfileService } from '../../../services/business-profile.service';
import { ComponentBase } from '../../../core/directives/component-base.directive';
import { finalize, takeUntil } from 'rxjs';
import { BaseResponse } from '../../../core/models/baseResponse';
import { FallbackImgDirective } from '../../../core/directives/fallback-img.directive';
import { UploadFilesComponent } from '../../../shared/components/fields/upload-files/upload-files.component';
import { SafePipe } from '../../../core/pipes/safe.pipe';
import { environment } from '../../../../environments/environment';

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
      FallbackImgDirective,
      UploadFilesComponent,
      SafePipe
    ],
  templateUrl: './business-profile-list.component.html',
  styleUrls: ['./business-profile-list.component.scss'],
  providers: [MessageService]
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

  constructor(
    private fb: FormBuilder,
    private businessProfileService: BusinessProfileService,
    private messageService: MessageService
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
      privacyPolicy: this.fb.group({
        en: ['', [Validators.required, Validators.minLength(50)]],
        ar: ['', [Validators.required, Validators.minLength(50)]]
      }),
      termsOfService: this.fb.group({
        en: ['', [Validators.required, Validators.minLength(50)]],
        ar: ['', [Validators.required, Validators.minLength(50)]]
      }),
      faq: this.fb.array([])
    });
  }

  get faqArray(): FormArray {
    return this.businessProfileForm.get('faq') as FormArray;
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
      privacyPolicy: {
        en: profile.privacyPolicy.en,
        ar: profile.privacyPolicy.ar
      },
      termsOfService: {
        en: profile.termsOfService.en,
        ar: profile.termsOfService.ar
      },
      faq: profile.faq
    });

    // Update logo control
    this.logoDarkControl.setValue(profile.logo_dark);
    this.logoLightControl.setValue(profile.logo_light);

    // Populate FAQ array
    this.faqArray.clear();
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

  toggleEditMode() {
    this.isEditMode.set(!this.isEditMode());
    if (!this.isEditMode()) {
      // Reset form to original values
      if (this.businessProfile) {
        this.populateForm(this.businessProfile);
      }
    } else {
      // Update logo control when entering edit mode
      this.logoDarkControl.setValue(this.businessProfileForm.get('logo_dark')?.value);
      this.logoLightControl.setValue(this.businessProfileForm.get('logo_light')?.value);
    }
  }

  toggleEditor() {
    this.showEditor.set(!this.showEditor());
  }

  saveBusinessProfile() {
    this.saving.set(true);
    const formData = this.businessProfileForm.value;
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
            // Update logo control with new data
            this.logoDarkControl.setValue(response.data.logo_dark);
            this.logoLightControl.setValue(response.data.logo_light);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Business Profile Updated Successfully'
            });
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
            // Update logo control with new data
            this.logoDarkControl.setValue(response.data.logo_dark);
            this.logoLightControl.setValue(response.data.logo_light);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Business Profile Created Successfully'
            });
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
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) {
        return `${fieldName}${language ? ` (${language.toUpperCase()})` : ''} is required`;
      }
      if (field.errors?.['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors?.['minlength']) {
        return `${fieldName}${language ? ` (${language.toUpperCase()})` : ''} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
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
} 