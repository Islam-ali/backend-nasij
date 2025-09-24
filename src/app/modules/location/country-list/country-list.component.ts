import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { of } from 'rxjs';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';

// Services and Interfaces
import { CountryService } from '../../../services/country.service';
import { ICountry } from '../../../interfaces/country.interface';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';

@Component({
  selector: 'app-country-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    CheckboxModule,
    MultiLanguagePipe
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './country-list.component.html',
  styleUrls: ['./country-list.component.scss']
})
export class CountryListComponent implements OnInit, OnDestroy {
  countries = signal<ICountry[]>([]);
  loading = signal(false);
  saving = signal(false);
  submitted = signal(false);
  dialogVisible = signal(false);
  isEdit = signal(false);
  selectedCountry = signal<ICountry | null>(null);
  
  countryForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private countryService: CountryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.countryForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCountries();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nameEn: ['', [Validators.required, Validators.minLength(2)]],
      nameAr: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', [Validators.required, Validators.minLength(2)]],
      defaultShippingCost: [0, [Validators.required, Validators.min(0)]],
      isActive: [true]
    });
  }

  loadCountries(): void {
    this.loading.set(true);
    this.countryService.getCountries(true).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (countries) => {
        this.countries.set(countries.data || []);
      },
      error: (error) => {
        console.error('Error loading countries:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load countries',
          life: 3000
        });
      }
    });
  }

  openDialog(): void {
    this.isEdit.set(false);
    this.selectedCountry.set(null);
    this.countryForm.reset();
    this.countryForm.patchValue({
      isActive: true,
      defaultShippingCost: 0
    });
    this.submitted.set(false);
    this.dialogVisible.set(true);
  }

  editCountry(country: ICountry): void {
    this.isEdit.set(true);
    this.selectedCountry.set(country);
    this.countryForm.patchValue({
      nameEn: country.name.en,
      nameAr: country.name.ar,
      code: country.code,
      defaultShippingCost: country.defaultShippingCost,
      isActive: country.isActive
    });
    this.submitted.set(false);
    this.dialogVisible.set(true);
  }

  viewCountry(country: ICountry): void {
    console.log('View country:', country);
  }

  saveCountry(): void {
    this.submitted.set(true);
    
    if (this.countryForm.valid) {
      this.saving.set(true);
      
      const countryData = {
        name: {
          en: this.countryForm.value.nameEn,
          ar: this.countryForm.value.nameAr
        },
        code: this.countryForm.value.code.toUpperCase(),
        defaultShippingCost: this.countryForm.value.defaultShippingCost,
        isActive: this.countryForm.value.isActive
      };

      const operation = this.isEdit() 
        ? this.countryService.updateCountry(this.selectedCountry()!._id!, countryData)
        : this.countryService.createCountry(countryData);

      operation.pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: this.isEdit() ? 'Country updated successfully' : 'Country created successfully',
            life: 3000
          });
          this.closeDialog();
          this.loadCountries();
        }),
        catchError((error) => {
          console.error('Error saving country:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to save country',
            life: 3000
          });
          return of(null);
        }),
        finalize(() => this.saving.set(false))
      ).subscribe();
    }
  }

  deleteCountry(country: ICountry): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${country.name.en}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.countryService.deleteCountry(country._id!).pipe(
          takeUntil(this.destroy$),
          tap(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Country deleted successfully',
              life: 3000
            });
            this.loadCountries();
          }),
          catchError((error) => {
            console.error('Error deleting country:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Failed to delete country',
              life: 3000
            });
            return of(null);
          })
        ).subscribe();
      }
    });
  }

  closeDialog(): void {
    this.dialogVisible.set(false);
    this.countryForm.reset();
    this.submitted.set(false);
  }
}