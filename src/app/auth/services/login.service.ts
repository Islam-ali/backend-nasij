import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from '../../interfaces/user.interface';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = environment.apiUrl + '/auth';
  private tokenKey = 'token_pledge';
  user: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  constructor(
    private http: HttpClient,
    private router: Router
  ) { 
    // this.user.next(JSON.parse(localStorage.getItem('user_pledge') || '{}'));
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password });
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user_pledge');
    this.user.next(null);
    this.router.navigate(['/auth/login']);
  }

  getUser() {
    return this.user.asObservable() ;
  }

  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  saveUser(user: User) {
    localStorage.setItem('user_pledge', JSON.stringify(user));
  }

  isLoggedIn() {
    return !!this.getToken();
  }
  
}
