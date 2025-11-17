import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../auth/services/login.service';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const loginService = inject(LoginService);
  const router = inject(Router);
  const token = loginService.getToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Handle 404 by redirecting to signin page
        loginService.logout();
        if (router.url !== '/auth/login') {
          router.navigate(['/auth/login']);
        }
      }
      return throwError(() => error);
    })
  );
};