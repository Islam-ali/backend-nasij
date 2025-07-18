import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-dialog-content',
  template: `
    <div class="p-fluid">
      <form [formGroup]="form">
        <div *ngFor="let field of formFields">
          <div class="field">
            <label for="{{field.key}}">{{field.label}}</label>
            <input 
              pInputText 
              type="text" 
              id="{{field.key}}" 
              [formControlName]="field.key">
          </div>
        </div>
      </form>
    </div>
  `,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule
  ],
  standalone: true
})
export class DialogContentComponent {
  @Input() form!: FormGroup;
  @Input() formFields!: any[];
  @Input() isEdit = false;
}
