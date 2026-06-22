import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  imports: [TranslatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  readonly tokenSnippet: string;
  readonly callSnippet: string;

  constructor(readonly auth: AuthService) {
    const cid = auth.developer()?.client_id ?? 'cid_...';
    this.tokenSnippet = `curl -X POST https://api.tokeniza.net/v1/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{"client_id":"${cid}","client_secret":"sk_...","grant_type":"client_credentials"}'`;
    this.callSnippet = `curl -X POST https://api.tokeniza.net/v1/tokens/deploy \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"ERC20","name":"My Token","symbol":"MTK","network":"ethereumsepolia","supply":"1000000000000000000000","ownerAddress":"0x..."}'`;
  }
}
