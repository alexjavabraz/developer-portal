import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

interface Endpoint { method: string; path: string; descKey: string; }

@Component({
  selector: 'app-docs',
  imports: [TranslatePipe],
  templateUrl: './docs.html',
  styleUrl: './docs.scss',
})
export class DocsComponent {
  readonly baseUrl = 'https://api.tokeniza.net/v1';

  readonly tokenEndpoints: Endpoint[] = [
    { method: 'POST', path: '/tokens/deploy',   descKey: 'Deploy ERC-20/721/1155 contract' },
    { method: 'POST', path: '/tokens/mint',      descKey: 'Mint tokens to an address' },
    { method: 'POST', path: '/tokens/burn',      descKey: 'Burn tokens from an address' },
    { method: 'POST', path: '/tokens/pause',     descKey: 'Pause all transfers' },
    { method: 'POST', path: '/tokens/unpause',   descKey: 'Resume transfers' },
    { method: 'POST', path: '/tokens/transfer',  descKey: 'Transfer tokens between addresses' },
  ];

  readonly userEndpoints: Endpoint[] = [
    { method: 'POST', path: '/users',               descKey: 'Create a user account' },
    { method: 'POST', path: '/users/fiat-balance',  descKey: 'Add FIAT balance' },
    { method: 'POST', path: '/users/token-balance', descKey: 'Add token balance' },
  ];

  readonly authSnippet = `POST /v1/auth/token
Content-Type: application/json

{
  "client_id": "cid_...",
  "client_secret": "sk_...",
  "grant_type": "client_credentials"
}

→ { "access_token": "eyJ...", "token_type": "Bearer", "expires_in": 3600 }`;
}
