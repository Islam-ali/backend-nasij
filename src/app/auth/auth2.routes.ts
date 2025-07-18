import { Routes } from '@angular/router';
import { Access } from '../pages/auth/access';
import { Error } from '../pages/auth/error';
import { LoginComponent } from './login/login.component';

export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: LoginComponent }
] as Routes;
