import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IAuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/api/user';
  private token: string;
  private tokenTimer: any;
  private authStatusListener = new Subject<boolean>();
  private isAuthenticated = false;
  private userId: string;

  constructor(private http: HttpClient, private router: Router) { }

  getToken() {
    return this.token;
  }

  getUserId() {
    return this.userId;
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: IAuthData = { email, password };
    this.http.post(`${this.apiUrl}/join`, authData)
      .subscribe(
        (result) => {
          this.login(email, password);
          this.router.navigate(['/']);
        }
      );
  }

  login(email: string, password: string) {
    const authData: IAuthData = { email, password };
    this.http.post<{token: string, expiresIn: number, userId: string}>(`${this.apiUrl}/login`, authData)
      .subscribe(
        (auth) => {
          this.token = auth.token;

          if (this.token) {

            this.userId = auth.userId;

            const tokenExpirationTimeSecs: number = auth.expiresIn;

            this.setAuthTimer(tokenExpirationTimeSecs);

            this.authStatusListener.next(true);
            this.isAuthenticated = true;

            // Add token to localStorage
            const now = new Date();
            const expirationDate = new Date(now.getTime() + tokenExpirationTimeSecs * 1000);
            this.saveAuthData(this.token, expirationDate, this.userId);

            this.router.navigate(['/']);
          }

        }
      );
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();

    if (!authInformation) {
      return;
    }
    // Check if Exp Date is in the future
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();

    // Means token is still valid
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = null;
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number) {
    console.log('Setting timer ' + duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('tokenExpiration');
    const userId = localStorage.getItem('userId');

    if (!token || !expirationDate) {
      return;
    }

    return { token, expirationDate: new Date(expirationDate), userId };
  }
}
