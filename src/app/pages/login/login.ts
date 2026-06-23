import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent implements OnInit {
  email            = '';
  password         = '';
  totpCode         = '';
  loading          = signal(false);
  error            = signal('');
  emailNotVerified = signal(false);
  emailVerified    = signal(false);
  tokenInvalid     = signal(false);
  totpRequired     = signal(false);
  challengeToken   = signal('');

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.emailVerified.set(params['verified'] === 'true');
      this.tokenInvalid.set(params['error'] === 'token_invalid');
    });
  }

  submit(): void {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');
    this.emailNotVerified.set(false);

    this.auth.login(this.email, this.password).subscribe({
      next: result => {
        if (result.type === 'totp_required') {
          this.challengeToken.set(result.challengeToken);
          this.totpRequired.set(true);
          this.loading.set(false);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: err => {
        this.loading.set(false);
        const code = err.error?.error?.code;
        if (code === 'EMAIL_NOT_VERIFIED') {
          this.emailNotVerified.set(true);
        } else {
          this.error.set(err.status === 401 ? 'login.error_invalid' : 'login.error_generic');
        }
      },
    });
  }

  submitTotp(): void {
    if (!this.totpCode) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.verifyTotpLogin(this.challengeToken(), this.totpCode).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        this.loading.set(false);
        this.error.set(err.status === 401 ? 'login.error_invalid_totp' : 'login.error_generic');
      },
    });
  }

  backToLogin(): void {
    this.totpRequired.set(false);
    this.challengeToken.set('');
    this.totpCode = '';
    this.error.set('');
  }
}
