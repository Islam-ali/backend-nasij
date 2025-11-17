import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { LoginService } from '../../auth/services/login.service';

/**
 * Login Guard - Redirects authenticated users away from login page
 * If user is already logged in, redirects to dashboard
 */
export const loginGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  if (loginService.isLoggedIn()) {
    // User is already logged in, redirect to dashboard
    router.navigate(['/dashboard']);
    return false;
  }

  // User is not logged in, allow access to login page
  return true;
};


