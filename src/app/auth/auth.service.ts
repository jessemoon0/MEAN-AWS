import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IAuthData } from './auth-data.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/api/user';

  constructor(private http: HttpClient) { }

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
    this.http.post(`${this.apiUrl}/login`, authData)
      .subscribe(
        (result) => {
          console.log(result);
        }
      );
  }
}
