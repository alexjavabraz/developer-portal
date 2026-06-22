import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService, RegisterResponse } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  name     = '';
  email    = '';
  password = '';
  loading  = signal(false);
  error    = signal('');
  result   = signal<RegisterResponse | null>(null);
  copied   = signal<'id'|'secret'|null>(null);

  constructor(private auth: AuthService) {}

  submit(): void {
    if (!this.name || !this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: res => { this.loading.set(false); this.result.set(res); },
      error: err => {
        this.loading.set(false);
        this.error.set(err.status === 409 ? 'Email already registered.' : 'register.error_generic');
      },
    });
  }

  copy(text: string, field: 'id' | 'secret'): void {
    navigator.clipboard.writeText(text).then(() => {
      this.copied.set(field);
      setTimeout(() => this.copied.set(null), 2000);
    });
  }
}
