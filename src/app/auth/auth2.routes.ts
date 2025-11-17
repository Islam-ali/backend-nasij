import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { loginGuard } from '../core/guards/login.guard';

export default [
    // { path: 'access', component: Access },
    // { path: 'error', component: Error },
    { 
        path: 'login', 
        component: LoginComponent,
        canActivate: [loginGuard]
    }
] as Routes;
