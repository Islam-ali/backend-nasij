import { Component, OnInit, Input, ViewChild, Inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DialogContentComponent } from './dialog-content.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DynamicDialogModule, DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-crud',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputText,
    InputTextarea,
    DropdownModule,
    CheckboxModule,
    DialogModule,
    ConfirmDialogModule,
    DynamicDialogModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    ConfirmationService,
    MessageService,
    DialogService
  ],
  template: `
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h3>{{ title }}</h3>
        <button pButton
                type="button"
                label="Create {{ singularName }}"
                icon="pi pi-plus"
                (click)="openCreateModal()"></button>
      </div>

      <div class="card-body">
        <p-table [value]="items" [responsive]="true" [resizableColumns]="true">
          <ng-template pTemplate="header">
            <tr>
              <th *ngFor="let column of columns">{{ column }}</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-item>
            <tr>
              <td *ngFor="let column of columns">{{ item[column] }}</td>
              <td>
                <button pButton
                        type="button"
                        icon="pi pi-pencil"
                        (click)="openEditModal(item)"></button>
                <button pButton
                        type="button"
                        icon="pi pi-trash"
                        class="p-button-danger"
                        (click)="confirmDelete(item)"></button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Content Template -->
      <ng-template #content let-ref="ref">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="p-fluid">
            <div class="field" *ngFor="let field of formFields">
              <label>{{ field.label }}</label>
              <div class="p-inputgroup">
                <span *ngIf="field.type === 'select'" class="p-inputgroup-addon">
                  <i class="pi pi-filter"></i>
                </span>
                <p-dropdown *ngIf="field.type === 'select'"
                           [options]="field.options"
                           formControlName="{{ field.name }}"
                           placeholder="{{ field.placeholder }}">
                </p-dropdown>
                <input *ngIf="field.type === 'text'"
                       pInputText
                       formControlName="{{ field.name }}"
                       placeholder="{{ field.placeholder }}" />
                <textarea *ngIf="field.type === 'textarea'"
                          pInputTextarea
                          formControlName="{{ field.name }}"
                          placeholder="{{ field.placeholder }}">
                </textarea>
                <p-checkbox *ngIf="field.type === 'checkbox'"
                           formControlName="{{ field.name }}">
                </p-checkbox>
              </div>
              <small *ngIf="form.get(field.name)?.invalid && form.get(field.name)?.touched" class="p-error">
                {{ field.label }} is required
              </small>
            </div>
          </div>
          <div class="p-dialog-footer">
            <button pButton
                    type="button"
                    label="Cancel"
                    icon="pi pi-times"
                    (click)="ref.close()">
            </button>
            <button pButton
                    type="submit"
                    label="{{ isEdit ? 'Update' : 'Create' }}"
                    icon="pi pi-check"
                    [disabled]="form.invalid">
            </button>
          </div>
        </form>
      </ng-template>

      <!-- Delete Confirmation Dialog -->
      <p-confirmDialog [style]="{width: '50vw'}"
                      [acceptLabel]="'Yes'"
                      [rejectLabel]="'No'"
                      [header]="'Delete Confirmation'"
                      [message]="'Are you sure you want to delete this ' + singularName + '?'">
      </p-confirmDialog>
    </div>
  `,
  styles: [`
    :host ::ng-deep .p-dialog .p-dialog-content {
      padding: 0;
    }
    .field {
      margin-bottom: 1rem;
    }
    .p-dialog-footer {
      padding: 1rem;
      text-align: right;
    }
  `]
})
export class CrudComponent implements OnInit {
  @Input() title!: string;
  @Input() singularName!: string;
  @Input() columns!: string[];
  @Input() items: any[] = [];
  @Input() formFields!: any[];
  @Input() apiUrl!: string;
  form!: FormGroup;
  isEdit = false;
  selectedItem: any;
  ref: DynamicDialogRef | null = null;

  constructor(
    private dialogService: DialogService,
    private fb: FormBuilder,
    private http: HttpClient,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    // this.initializeForm();
  }

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.form = this.fb.group({});
    this.formFields.forEach(field => {
      const validators = field.required ? [Validators.required] : [];
      this.form.addControl(field.name, this.fb.control('', validators));
    });
  }



//   private refreshList() {
//     this.http.get<any[]>(this.apiUrl).subscribe(
//       (data) => {
//         this.items = data;
//       },
//       (error) => {
//         console.error('Error fetching items:', error);
//         this.messageService.add({
//           severity: 'error',
//           summary: 'Error',
//           detail: 'Failed to fetch ' + this.singularName + ' list'
//         });
//       }
//     );
//   }
  openCreateModal() {
    this.isEdit = false;
    this.form.reset();
    this.ref = this.dialogService.open(DialogContentComponent, {
      data: {
        header: 'Create ' + this.singularName
      },
      width: '50vw',
      contentStyle: { 'max-height': '500px', 'overflow': 'auto' }
    });
  }

  openEditModal(item: any) {
    this.isEdit = true;
    this.selectedItem = item;
    this.form.patchValue(item);
    this.ref = this.dialogService.open(DialogContentComponent, {
      data: {
        form: this.form,
        formFields: this.formFields,
        isEdit: this.isEdit
      },
      width: '50vw',
      contentStyle: { 'max-height': '500px', 'overflow': 'auto' }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formData = this.form.value;
      const url = this.isEdit ? 
        `${this.apiUrl}/${this.selectedItem.id}` : 
        this.apiUrl;

      this.http[this.isEdit ? 'put' : 'post'](url, formData).subscribe(
        () => {
          this.ref?.close();
          this.refreshList();
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: `${this.singularName} ${this.isEdit ? 'updated' : 'created'} successfully`
          });
        },
        error => {
          console.error('Error:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to save ' + this.singularName
          });
        }
      );
    }
  }

  confirmDelete(item: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this ' + this.singularName + '?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.http.delete(`${this.apiUrl}/${item._id}`).subscribe(
          () => {
            this.items = this.items.filter(i => i !== item);
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: `${this.singularName} deleted successfully`
            });
          },
          error => {
            console.error('Error:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete ' + this.singularName
            });
          }
        );
      }
    });
  }

  private refreshList() {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (data) => {
        this.items = data;
      },
      (error) => {
        console.error('Error fetching items:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch ' + this.singularName + ' list'
        });
      }
    );
  }
    //   const response = await this.http.get<any[]>(this.apiUrl).toPromise();
    //   if (response) {
    //     this.items = response;
    //   }
    // } catch (error) {
    //   console.error('Error refreshing list:', error);
    //   this.messageService.add({
    //     severity: 'error',
    //     summary: 'Error',
    //     detail: 'Failed to refresh list'
    //   });
    // }
//   }
}
