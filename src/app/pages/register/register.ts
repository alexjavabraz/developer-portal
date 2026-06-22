import { Component, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService, RegisterResponse } from '../../services/auth';

// A07 — RFC 5321 email pattern (max 254 chars enforced separately by Validators.maxLength)
const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

// A03 — rejects HTML tags, javascript: URI, event handlers, SQL DDL, path traversal, numeric entities
const INJECTION_RE =
  /(<[^>]+>|javascript:|on\w+=|\b(?:DROP|SELECT|INSERT|UPDATE|DELETE|UNION|EXEC|CREATE|ALTER|TRUNCATE)\b|\.\.[/\\]|&#x)/i;

function emailFormat(ctrl: AbstractControl): ValidationErrors | null {
  const v: string = ctrl.value ?? '';
  return v && !EMAIL_RE.test(v) ? { emailFormat: true } : null;
}

function noInjection(ctrl: AbstractControl): ValidationErrors | null {
  return ctrl.value && INJECTION_RE.test(ctrl.value) ? { injection: true } : null;
}

// A04 — complexity: uppercase + lowercase + digit + special char
function passwordStrength(ctrl: AbstractControl): ValidationErrors | null {
  const v: string = ctrl.value ?? '';
  if (!v) return null;
  const missing: string[] = [];
  if (!/[A-Z]/.test(v)) missing.push('uppercase');
  if (!/[a-z]/.test(v)) missing.push('lowercase');
  if (!/\d/.test(v))    missing.push('digit');
  if (!/[^A-Za-z0-9]/.test(v)) missing.push('special');
  return missing.length ? { strength: { missing } } : null;
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  form = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
      noInjection,
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.maxLength(254),
      emailFormat,
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(128),
      passwordStrength,
    ]),
  });

  loading  = signal(false);
  error    = signal('');
  result   = signal<RegisterResponse | null>(null);
  copied   = signal<'id' | 'secret' | 'salt' | null>(null);

  constructor(private auth: AuthService) {}

  get name()     { return this.form.get('name')!; }
  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  missingStrength(): string[] {
    return this.password.errors?.['strength']?.missing ?? [];
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');

    const { name, email, password } = this.form.value;
    this.auth.register({ name: name!, email: email!, password: password! }).subscribe({
      next: res => { this.loading.set(false); this.result.set(res); },
      error: err => {
        this.loading.set(false);
        this.error.set(
          err.status === 409 ? 'register.error_email_conflict' : 'register.error_generic',
        );
      },
    });
  }

  copy(text: string, field: 'id' | 'secret' | 'salt'): void {
    navigator.clipboard.writeText(text).then(() => {
      this.copied.set(field);
      setTimeout(() => this.copied.set(null), 2000);
    });
  }

  downloadCredentials(): void {
    const res = this.result();
    if (!res) return;
    const text = [
      'CaaS API Credentials',
      '====================',
      '',
      `Client ID:     ${res.client_id}`,
      `Client Secret: ${res.client_secret}`,
      `API Salt:      ${res.api_salt}`,
      '',
      'Keep this file secure. The secret and salt cannot be retrieved again.',
      'To rotate the secret or regenerate the salt, log in to the developer portal.',
    ].join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'caas-credentials.txt';
    a.click();
    URL.revokeObjectURL(url);
  }
}
