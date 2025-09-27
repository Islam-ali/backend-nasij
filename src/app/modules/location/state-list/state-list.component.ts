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
import { DropdownModule } from 'primeng/dropdown';

// Services and Interfaces
import { StateService } from '../../../services/state.service';
import { CountryService } from '../../../services/country.service';
import { IState } from '../../../interfaces/state.interface';
import { ICountry } from '../../../interfaces/country.interface';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';

@Component({
  selector: 'app-state-list',
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
    DropdownModule,
    MultiLanguagePipe
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './state-list.component.html',
  styleUrls: ['./state-list.component.scss']
})
export class StateListComponent implements OnInit, OnDestroy {
  states = signal<IState[]>([]);
  countries = signal<ICountry[]>([]);
  loading = signal(false);
  saving = signal(false);
  submitted = signal(false);
  dialogVisible = signal(false);
  isEdit = signal(false);
  selectedState = signal<IState | null>(null);
  
  stateForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private stateService: StateService,
    private countryService: CountryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.stateForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCountries();
    this.loadStates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: this.fb.group({
        en: ['', [Validators.required, Validators.minLength(2)]],
        ar: ['', [Validators.required, Validators.minLength(2)]]
      }),
      code: ['', [Validators.required, Validators.minLength(2)]],
      shippingCost: [0, [Validators.required, Validators.min(0)]],
      countryId: ['', [Validators.required]],
      isActive: [true]
    });
  }

  loadCountries(): void {
    this.countryService.getCountries().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (countries) => {
        this.countries.set(countries.data || []);
      },
      error: (error) => {
        console.error('Error loading countries:', error);
      }
    });
  }

  loadStates(): void {
    this.loading.set(true);
    this.stateService.getStates().pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (states) => {
        this.states.set(states.data  || []);
      },
      error: (error) => {
        console.error('Error loading states:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load states',
          life: 3000
        });
      }
    });
  }

  openDialog(): void {
    this.isEdit.set(false);
    this.selectedState.set(null);
    this.stateForm.reset();
    this.stateForm.patchValue({
      isActive: true,
      shippingCost: 0
    });
    this.submitted.set(false);
    this.dialogVisible.set(true);
  }

  editState(state: IState): void {
    this.isEdit.set(true);
    this.selectedState.set(state);
    this.stateForm.patchValue({
      nameEn: state.name.en,
      nameAr: state.name.ar,
      code: state.code,
      shippingCost: state.shippingCost,
      countryId: state.countryId._id,
      isActive: state.isActive
    });
    this.submitted.set(false);
    this.dialogVisible.set(true);
  }

  viewState(state: IState): void {
    console.log('View state:', state);
  }

  saveState(): void {
    this.submitted.set(true);
    
    if (this.stateForm.valid) {
      this.saving.set(true);
      
      const stateData = {
        name: {
          en: this.stateForm.value.name.en,
          ar: this.stateForm.value.name.ar,
        },
        code: this.stateForm.value.code.toUpperCase(),
        shippingCost: this.stateForm.value.shippingCost,
        countryId: this.stateForm.value.countryId,
        isActive: this.stateForm.value.isActive
      };

      const operation = this.isEdit() 
        ? this.stateService.updateState(this.selectedState()!._id!, stateData)
        : this.stateService.createState(stateData);

      operation.pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: this.isEdit() ? 'State updated successfully' : 'State created successfully',
            life: 3000
          });
          this.closeDialog();
          this.loadStates();
        }),
        catchError((error) => {
          console.error('Error saving state:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to save state',
            life: 3000
          });
          return of(null);
        }),
        finalize(() => this.saving.set(false))
      ).subscribe();
    }
  }

  deleteState(state: IState): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${state.name.en}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.stateService.deleteState(state._id!).pipe(
          takeUntil(this.destroy$),
          tap(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'State deleted successfully',
              life: 3000
            });
            this.loadStates();
          }),
          catchError((error) => {
            console.error('Error deleting state:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Failed to delete state',
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
    this.stateForm.reset();
    this.submitted.set(false);
  }

}