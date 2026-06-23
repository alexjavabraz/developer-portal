import { Component, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiKeysService, CredentialInfo } from '../../services/api-keys';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-keys',
  imports: [TranslatePipe, DecimalPipe],
  templateUrl: './keys.html',
  styleUrl: './keys.scss',
})
export class KeysComponent implements OnInit {
  cred             = signal<CredentialInfo | null>(null);
  credError        = signal(false);
  newSecret        = signal<string | null>(null);
  newSalt          = signal<string | null>(null);
  rotating         = signal(false);
  saltRegenerating = signal(false);
  copied           = signal<'id' | 'secret' | 'salt' | null>(null);

  constructor(private svc: ApiKeysService, readonly auth: AuthService) {}

  ngOnInit(): void {
    this.svc.getMyCredentials().subscribe({
      next: c => this.cred.set(c),
      error: () => this.credError.set(true),
    });
  }

  rotateSecret(): void {
    if (!confirm('Are you sure? Your current secret will be invalidated.')) return;
    this.rotating.set(true);
    this.svc.rotateSecret().subscribe({
      next: res => {
        this.rotating.set(false);
        this.newSecret.set(res.client_secret);
        if (this.cred()) {
          this.cred.update(c => c ? { ...c, is_active: true } : c);
        }
      },
      error: () => this.rotating.set(false),
    });
  }

  regenerateSalt(): void {
    if (!confirm('Are you sure? Your current salt will be invalidated and your integration will break until updated.')) return;
    this.saltRegenerating.set(true);
    this.svc.regenerateSalt().subscribe({
      next: res => {
        this.saltRegenerating.set(false);
        this.newSalt.set(res.api_salt);
        this.cred.update(c => c ? { ...c, api_salt: res.api_salt } : c);
      },
      error: () => this.saltRegenerating.set(false),
    });
  }

  copy(text: string, field: 'id' | 'secret' | 'salt'): void {
    navigator.clipboard.writeText(text).then(() => {
      this.copied.set(field);
      setTimeout(() => this.copied.set(null), 2000);
    });
  }

  get clientId(): string { return this.auth.developer()?.client_id ?? ''; }
  get isActive(): boolean { return this.cred()?.is_active ?? true; }
  get currentSalt(): string { return this.cred()?.api_salt ?? ''; }
}
