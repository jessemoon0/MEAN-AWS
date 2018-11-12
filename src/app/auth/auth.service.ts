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

  constructor(private http: HttpClient, private router: Router) { }

  getToken() {
    return this.token;
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
          console.log(result);
        }
      );
  }

  login(email: string, password: string) {
    const authData: IAuthData = { email, password };
    this.http.post<{token: string, expiresIn: number}>(`${this.apiUrl}/login`, authData)
      .subscribe(
        (auth) => {
          this.token = auth.token;

          if (this.token) {

            const tokenExpirationTimeSecs: number = auth.expiresIn;
            this.tokenTimer = setTimeout(() => {
              this.logout();
            }, tokenExpirationTimeSecs * 1000);

            this.authStatusListener.next(true);
            this.isAuthenticated = true;
            this.router.navigate(['/']);
          }

        }
      );
  }

  logout() {
    this.token = null;
    clearTimeout(this.tokenTimer);
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.router.navigate(['/']);
  }
}
