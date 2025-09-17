import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RegisterRequestBackend, RegisterResponse } from '../interfaces/auth';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  constructor(private http: HttpClient) {}

  register(registerData: RegisterRequestBackend): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${environment.backendBaseUrl}/auth/register`,
      registerData
    );
  }
}
