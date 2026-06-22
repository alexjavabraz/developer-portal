import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface CredentialInfo {
  client_id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface RotateResponse { client_secret: string; }

@Injectable({ providedIn: 'root' })
export class ApiKeysService {
  constructor(private http: HttpClient) {}

  getMyCredentials() {
    return this.http.get<CredentialInfo>(`${environment.apiUrl}/v1/auth/me`);
  }

  rotateSecret() {
    return this.http.post<RotateResponse>(`${environment.apiUrl}/v1/auth/rotate-secret`, {});
  }
}
