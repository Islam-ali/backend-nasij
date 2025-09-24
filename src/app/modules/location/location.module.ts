import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CountryListComponent } from './country-list/country-list.component';
import { StateListComponent } from './state-list/state-list.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'countries',
        component: CountryListComponent,
        data: { title: 'Countries Management' }
      },
      {
        path: 'states',
        component: StateListComponent,
        data: { title: 'States Management' }
      },
      {
        path: '',
        redirectTo: 'countries',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CountryListComponent,
    StateListComponent
  ]
})
export class LocationModule { }