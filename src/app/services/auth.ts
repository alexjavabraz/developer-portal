import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Developer { client_id: string; name: string; email: string; }
export interface RegisterRequest { name: string; email: string; password: string; }
export interface RegisterResponse { client_id: string; client_secret: string; api_salt: string; }

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
      switchMap(() =>
        this.http.get<{ total: number }>(`${environment.apiUrl}/v1/auth/requests`).pipe(
          tap(stats => this.setTotal(stats.total)),
          catchError(() => of(null)),
        )
      ),
    );
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
