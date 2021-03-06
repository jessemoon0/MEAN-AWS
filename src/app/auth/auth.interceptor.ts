import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken: string = this.authService.getToken();
    // We have to clone the request instead of manipulate it for immutability
    const authRequest = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${authToken}`)
    });
    return next.handle(authRequest);
  }

}
