import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface CredentialInfo {
  client_id: string;
  name: string;
  email: string;
  is_active: boolean;
  api_salt: string;
  created_at: string;
}

export interface RotateResponse {
  client_id: string;
  client_secret: string;
  message: string;
}

export interface RegenerateSaltResponse {
  api_salt: string;
  message: string;
}

export interface ApiRequestRecord {
  method: string;
  path: string;
  status_code: number;
  idempotency_key: string | null;
  is_idempotent_hit: boolean;
  created_at: string;
}

export interface RequestStats {
  total: number;
  requests: ApiRequestRecord[];
}

@Injectable({ providedIn: 'root' })
export class ApiKeysService {
  constructor(private http: HttpClient) {}

  getMyCredentials() {
    return this.http.get<CredentialInfo>(`${environment.apiUrl}/v1/auth/me`);
  }

  rotateSecret() {
    return this.http.post<RotateResponse>(`${environment.apiUrl}/v1/auth/rotate-secret`, {});
  }

  getRequestStats() {
    return this.http.get<RequestStats>(`${environment.apiUrl}/v1/auth/requests`);
  }

  regenerateSalt() {
    return this.http.post<RegenerateSaltResponse>(`${environment.apiUrl}/v1/auth/regenerate-salt`, {});
  }
}
