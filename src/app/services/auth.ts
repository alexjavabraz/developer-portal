import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Developer { client_id: string; name: string; email: string; }
export interface RegisterRequest { name: string; email: string; password: string; }
export interface RegisterResponse { client_id: string; client_secret: string; api_salt: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'dp_token';
  private readonly DEV_KEY   = 'dp_developer';

  readonly developer = signal<Developer | null>(this.loadDeveloper());

  constructor(private http: HttpClient, private router: Router) {}

  register(payload: RegisterRequest) {
    return this.http.post<RegisterResponse>(`${environment.apiUrl}/v1/auth/register`, payload);
  }

  login(email: string, password: string) {
    return this.http.post<{ access_token: string; developer: Developer }>(
      `${environment.apiUrl}/v1/auth/developer/login`,
      { email, password },
    ).pipe(
      tap(res => {
        sessionStorage.setItem(this.TOKEN_KEY, res.access_token);
        sessionStorage.setItem(this.DEV_KEY, JSON.stringify(res.developer));
        this.developer.set(res.developer);
      }),
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.DEV_KEY);
    this.developer.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null { return sessionStorage.getItem(this.TOKEN_KEY); }
  isLoggedIn(): boolean { return !!this.getToken(); }

  private loadDeveloper(): Developer | null {
    try {
      const raw = sessionStorage.getItem(this.DEV_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
