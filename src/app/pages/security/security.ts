import { Component, OnInit, signal, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../services/auth';
import QRCode from 'qrcode';

@Component({
  selector: 'app-security',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './security.html',
  styleUrl: './security.scss',
})
export class SecurityComponent implements OnInit {
  @ViewChild('qrCanvas', { static: false }) qrCanvas!: ElementRef<HTMLCanvasElement>;

  totpEnabled   = signal(false);
  loading       = signal(true);
  step          = signal<'idle' | 'setup' | 'disable'>('idle');
  qrDataUrl     = signal('');
  code          = '';
  actionLoading = signal(false);
  successMsg    = signal('');
  errorMsg      = signal('');

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.getMe().subscribe({
      next: me => {
        this.totpEnabled.set(me.totp_enabled);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  startSetup(): void {
    this.clearMessages();
    this.step.set('setup');
    this.actionLoading.set(true);
    this.auth.setupTotp().subscribe({
      next: async res => {
        this.actionLoading.set(false);
        try {
          this.qrDataUrl.set(await QRCode.toDataURL(res.otpauth_uri, { width: 200, margin: 1 }));
        } catch {
          this.qrDataUrl.set('');
        }
      },
      error: () => {
        this.actionLoading.set(false);
        this.errorMsg.set('security.error_generic');
        this.step.set('idle');
      },
    });
  }

  confirmSetup(): void {
    if (!this.code) return;
    this.clearMessages();
    this.actionLoading.set(true);
    this.auth.confirmTotp(this.code).subscribe({
      next: () => {
        this.totpEnabled.set(true);
        this.step.set('idle');
        this.code = '';
        this.qrDataUrl.set('');
        this.actionLoading.set(false);
        this.successMsg.set('security.success_enabled');
      },
      error: err => {
        this.actionLoading.set(false);
        const apiCode = err.error?.error?.code;
        this.errorMsg.set(apiCode === 'INVALID_TOTP_CODE' ? 'security.error_invalid_code' : 'security.error_generic');
      },
    });
  }

  startDisable(): void {
    this.clearMessages();
    this.code = '';
    this.step.set('disable');
  }

  confirmDisable(): void {
    if (!this.code) return;
    this.clearMessages();
    this.actionLoading.set(true);
    this.auth.disableTotp(this.code).subscribe({
      next: () => {
        this.totpEnabled.set(false);
        this.step.set('idle');
        this.code = '';
        this.actionLoading.set(false);
        this.successMsg.set('security.success_disabled');
      },
      error: err => {
        this.actionLoading.set(false);
        const apiCode = err.error?.error?.code;
        this.errorMsg.set(apiCode === 'INVALID_TOTP_CODE' ? 'security.error_invalid_code' : 'security.error_generic');
      },
    });
  }

  cancel(): void {
    this.step.set('idle');
    this.code = '';
    this.qrDataUrl.set('');
    this.clearMessages();
  }

  private clearMessages(): void {
    this.successMsg.set('');
    this.errorMsg.set('');
  }
}
