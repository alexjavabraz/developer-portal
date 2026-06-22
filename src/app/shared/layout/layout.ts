import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class LayoutComponent {
  private translate = inject(TranslateService);
  readonly auth     = inject(AuthService);

  readonly langs = ['en', 'pt', 'es'] as const;
  readonly currentLang = signal<string>(localStorage.getItem('lang') ?? 'en');

  readonly navItems = [
    { path: '/dashboard', icon: 'bi-grid-1x2-fill', key: 'nav.dashboard' },
    { path: '/keys',      icon: 'bi-key-fill',      key: 'nav.keys' },
    { path: '/docs',      icon: 'bi-book-fill',      key: 'nav.docs' },
  ];

  setLang(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    this.currentLang.set(lang);
  }

  logout(): void { this.auth.logout(); }
}
