import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Developer { client_id: string; name: string; email: string; }
export interface RegisterRequest { name: string; email: string; password: string; }
export interface RegisterResponse { client_id: string; client_secret: string; api_salt: string; }
export interface TotpSetupResponse { otpauth_uri: string; totp_enabled: boolean; }
export interface MeResponse {
  client_id: string;
  name: string;
  email: string;
  is_active: boolean;
  api_salt: string;
  totp_enabled: boolean;
  created_at: string;
}

export type LoginResult =
  | { type: 'success'; developer: Developer }
  | { type: 'totp_required'; challengeToken: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY   = 'dp_token';
  private readonly DEV_KEY     = 'dp_developer';
  private readonly TOTAL_KEY   = 'dp_total_requests';

  readonly developer     = signal<Developer | null>(this.loadDeveloper());
  readonly totalRequests = signal<number | null>(this.loadTotal());

  constructor(private http: HttpClient, private router: Router) {}

  register(payload: RegisterRequest) {
    return this.http.post<RegisterResponse>(`${environment.apiUrl}/v1/auth/register`, payload);
  }

  login(email: string, password: string): Observable<LoginResult> {
    return this.http.post<{
      totp_required?: boolean;
      challenge_token?: string;
      access_token?: string;
      developer?: Developer;
    }>(
      `${environment.apiUrl}/v1/auth/developer/login`,
      { email, password },
    ).pipe(
      switchMap(res => {
        if (res.totp_required && res.challenge_token) {
          return of({ type: 'totp_required' as const, challengeToken: res.challenge_token });
        }
        const accessToken = res.access_token!;
        const developer   = res.developer!;
        sessionStorage.setItem(this.TOKEN_KEY, accessToken);
        sessionStorage.setItem(this.DEV_KEY, JSON.stringify(developer));
        this.developer.set(developer);
        return this.http.get<{ total: number }>(`${environment.apiUrl}/v1/auth/requests`).pipe(
          tap(stats => this.setTotal(stats.total)),
          catchError(() => of(null)),
          map(() => ({ type: 'success' as const, developer })),
        );
      }),
    );
  }

  verifyTotpLogin(challengeToken: string, code: string): Observable<Developer> {
    return this.http.post<{ access_token: string; developer: Developer }>(
      `${environment.apiUrl}/v1/auth/totp/verify-login`,
      { challenge_token: challengeToken, code },
    ).pipe(
      switchMap(res => {
        sessionStorage.setItem(this.TOKEN_KEY, res.access_token);
        sessionStorage.setItem(this.DEV_KEY, JSON.stringify(res.developer));
        this.developer.set(res.developer);
        return this.http.get<{ total: number }>(`${environment.apiUrl}/v1/auth/requests`).pipe(
          tap(stats => this.setTotal(stats.total)),
          catchError(() => of(null)),
          map(() => res.developer),
        );
      }),
    );
  }

  getMe(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${environment.apiUrl}/v1/auth/me`);
  }

  setupTotp(): Observable<TotpSetupResponse> {
    return this.http.post<TotpSetupResponse>(`${environment.apiUrl}/v1/auth/totp/setup`, {});
  }

  confirmTotp(code: string): Observable<{ totp_enabled: boolean }> {
    return this.http.post<{ totp_enabled: boolean }>(`${environment.apiUrl}/v1/auth/totp/confirm`, { code });
  }

  disableTotp(code: string): Observable<{ totp_enabled: boolean }> {
    return this.http.post<{ totp_enabled: boolean }>(`${environment.apiUrl}/v1/auth/totp/disable`, { code });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/v1/auth/change-password`, {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  setTotal(total: number): void {
    sessionStorage.setItem(this.TOTAL_KEY, String(total));
    this.totalRequests.set(total);
  }

  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.DEV_KEY);
    sessionStorage.removeItem(this.TOTAL_KEY);
    this.developer.set(null);
    this.totalRequests.set(null);
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

  private loadTotal(): number | null {
    const raw = sessionStorage.getItem(this.TOTAL_KEY);
    return raw !== null ? parseInt(raw, 10) : null;
  }
}
