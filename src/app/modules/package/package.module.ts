import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PackageListComponent } from './package-list/package-list.component';
import { PackageDetailComponent } from './package-detail/package-detail.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PackageListComponent,
    PackageDetailComponent,
    RouterModule.forChild([
      {
        path: '',
        component: PackageListComponent
      },
      {
        path: ':id',
        component: PackageDetailComponent
      }
    ])
  ]
})
export class PackageModule { } 