import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPasswordComponent {
  email   = '';
  loading = signal(false);
  sent    = signal(false);
  error   = signal('');

  constructor(private http: HttpClient) {}

  submit(): void {
    const email = this.email.trim();
    if (!email || this.loading() || this.sent()) return;
    this.loading.set(true);
    this.error.set('');

    this.http.post(`${environment.apiUrl}/v1/auth/forgot-password`, { email }).subscribe({
      next: () => { this.loading.set(false); this.sent.set(true); },
      error: () => {
        this.loading.set(false);
        this.error.set('forgot_password.error_generic');
      },
    });
  }
}
