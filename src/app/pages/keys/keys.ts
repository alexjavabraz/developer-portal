import { Component, OnInit, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiKeysService, CredentialInfo } from '../../services/api-keys';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-keys',
  imports: [TranslatePipe],
  templateUrl: './keys.html',
  styleUrl: './keys.scss',
})
export class KeysComponent implements OnInit {
  cred       = signal<CredentialInfo | null>(null);
  revealed   = signal(false);
  newSecret  = signal<string | null>(null);
  rotating   = signal(false);
  copied     = signal<'id'|'secret'|null>(null);

  constructor(private svc: ApiKeysService, private auth: AuthService) {}

  ngOnInit(): void {
    this.svc.getMyCredentials().subscribe({
      next: c => this.cred.set(c),
      error: () => {},
    });
  }

  rotateSecret(): void {
    if (!confirm('Are you sure? Your current secret will be invalidated.')) return;
    this.rotating.set(true);
    this.svc.rotateSecret().subscribe({
      next: res => { this.rotating.set(false); this.newSecret.set(res.client_secret); this.revealed.set(true); },
      error: () => this.rotating.set(false),
    });
  }

  copy(text: string, field: 'id'|'secret'): void {
    navigator.clipboard.writeText(text).then(() => {
      this.copied.set(field);
      setTimeout(() => this.copied.set(null), 2000);
    });
  }

  get clientId(): string { return this.auth.developer()?.client_id ?? ''; }
}
