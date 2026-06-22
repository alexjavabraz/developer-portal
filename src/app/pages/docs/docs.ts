import { Component, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export interface EndpointDef {
  method: string;
  path: string;
  desc: string;
  payload: string;
  response: string;
  codes: { code: number; label: string }[];
}

@Component({
  selector: 'app-docs',
  imports: [TranslatePipe],
  templateUrl: './docs.html',
  styleUrl: './docs.scss',
})
export class DocsComponent {
  readonly baseUrl = 'https://api.tokeniza.online/v1';

  expanded = signal<string | null>(null);

  toggle(path: string): void {
    this.expanded.update(v => (v === path ? null : path));
  }

  readonly tokenEndpoints: EndpointDef[] = [
    {
      method: 'POST',
      path: '/tokens',
      desc: 'Deploy an ERC-20, ERC-721 or ERC-1155 contract',
      payload: JSON.stringify(
        {
          standard: 'ERC20',
          network: 'ethereum',
          name: 'My Token',
          symbol: 'MTK',
          decimals: 18,
          supply: 1000000,
          owner_address: '0xABC...',
          idempotency_key: 'uuid-v4',
        },
        null,
        2,
      ),
      response: JSON.stringify(
        { operation_id: 'uuid-v4', status: 'queued', message: 'Token deployment queued.' },
        null,
        2,
      ),
      codes: [
        { code: 200, label: 'Queued successfully' },
        { code: 400, label: 'Validation error (invalid address, missing field)' },
        { code: 401, label: 'Missing or invalid Bearer token' },
      ],
    },
    {
      method: 'POST',
      path: '/tokens/:address/mint',
      desc: 'Mint tokens to an address',
      payload: JSON.stringify(
        { network: 'ethereum', standard: 'ERC20', to: '0xABC...', amount: '1000000000000000000', idempotency_key: 'uuid-v4' },
        null,
        2,
      ),
      response: JSON.stringify(
        { operation_id: 'uuid-v4', status: 'queued', message: 'Mint queued.' },
        null,
        2,
      ),
      codes: [
        { code: 200, label: 'Queued successfully' },
        { code: 400, label: 'Invalid address or amount' },
        { code: 401, label: 'Unauthorized' },
      ],
    },
    {
      method: 'POST',
      path: '/tokens/:address/burn',
      desc: 'Burn tokens from an address',
      payload: JSON.stringify(
        { network: 'ethereum', standard: 'ERC20', from: '0xABC...', amount: '500000000000000000', idempotency_key: 'uuid-v4' },
        null,
        2,
      ),
      response: JSON.stringify(
        { operation_id: 'uuid-v4', status: 'queued', message: 'Burn queued.' },
        null,
        2,
      ),
      codes: [
        { code: 200, label: 'Queued successfully' },
        { code: 400, label: 'Invalid address or amount' },
        { code: 401, label: 'Unauthorized' },
      ],
    },
    {
      method: 'POST',
      path: '/tokens/:address/pause',
      desc: 'Pause all transfers for the contract',
      payload: JSON.stringify(
        { network: 'ethereum', standard: 'ERC20', idempotency_key: 'uuid-v4' },
        null,
        2,
      ),
      response: JSON.stringify(
        { operation_id: 'uuid-v4', status: 'queued', message: 'Pause queued.' },
        null,
        2,
      ),
      codes: [
        { code: 200, label: 'Queued successfully' },
        { code: 401, label: 'Unauthorized' },
      ],
    },
    {
      method: 'POST',
      path: '/tokens/:address/unpause',
      desc: 'Resume transfers for the contract',
      payload: JSON.stringify(
        { network: 'ethereum', standard: 'ERC20', idempotency_key: 'uuid-v4' },
        null,
        2,
      ),
      response: JSON.stringify(
        { operation_id: 'uuid-v4', status: 'queued', message: 'Unpause queued.' },
        null,
        2,
      ),
      codes: [
        { code: 200, label: 'Queued successfully' },
        { code: 401, label: 'Unauthorized' },
      ],
    },
    {
      method: 'POST',
      path: '/tokens/:address/transfer',
      desc: 'Transfer tokens between addresses',
      payload: JSON.stringify(
        { network: 'ethereum', standard: 'ERC20', to: '0xDEF...', amount: '100000000000000000', idempotency_key: 'uuid-v4' },
        null,
        2,
      ),
      response: JSON.stringify(
        { operation_id: 'uuid-v4', status: 'queued', message: 'Transfer queued.' },
        null,
        2,
      ),
      codes: [
        { code: 200, label: 'Queued successfully' },
        { code: 400, label: 'Invalid address or amount' },
        { code: 401, label: 'Unauthorized' },
      ],
    },
  ];

  readonly userEndpoints: EndpointDef[] = [
    {
      method: 'POST',
      path: '/users',
      desc: 'Create a user account with a managed wallet',
      payload: JSON.stringify(
        { external_id: 'user-123', email: 'user@example.com', network: 'ethereum', idempotency_key: 'uuid-v4' },
        null,
        2,
      ),
      response: JSON.stringify(
        { operation_id: 'uuid-v4', external_id: 'user-123', status: 'queued' },
        null,
        2,
      ),
      codes: [
        { code: 200, label: 'Queued successfully' },
        { code: 400, label: 'Validation error' },
        { code: 401, label: 'Unauthorized' },
      ],
    },
    {
      method: 'POST',
      path: '/users/:external_id/fiat-balance',
      desc: 'Add FIAT balance to a user account',
      payload: JSON.stringify(
        { amount: 10000, currency: 'BRL', idempotency_key: 'uuid-v4' },
        null,
        2,
      ),
      response: JSON.stringify(
        { operation_id: 'uuid-v4', external_id: 'user-123', status: 'queued' },
        null,
        2,
      ),
      codes: [
        { code: 200, label: 'Queued successfully' },
        { code: 400, label: 'Invalid amount (must be positive integer)' },
        { code: 401, label: 'Unauthorized' },
      ],
    },
    {
      method: 'POST',
      path: '/users/:external_id/token-balance',
      desc: 'Add token balance to a user account',
      payload: JSON.stringify(
        { network: 'ethereum', contract_address: '0xABC...', amount: '1000000000000000000', idempotency_key: 'uuid-v4' },
        null,
        2,
      ),
      response: JSON.stringify(
        { operation_id: 'uuid-v4', external_id: 'user-123', status: 'queued' },
        null,
        2,
      ),
      codes: [
        { code: 200, label: 'Queued successfully' },
        { code: 400, label: 'Invalid contract address or amount' },
        { code: 401, label: 'Unauthorized' },
      ],
    },
  ];

  readonly authSnippet = `POST /v1/auth/token
Content-Type: application/json

{
  "client_id": "cid_...",
  "client_secret": "sk_...",
  "grant_type": "client_credentials"
}

→ { "access_token": "eyJ...", "token_type": "Bearer", "expires_in": 3600 }`;

  readonly idempotencySnippet = `POST /v1/tokens
Authorization: Bearer eyJ...
X-Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{ ... }

# First call → processes normally
# Same key within 24h → returns cached response
# X-Idempotent-Replayed: true header is added on cached responses`;
}
