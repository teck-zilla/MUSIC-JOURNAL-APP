import { describe, expect, it } from 'vitest';

import { parseEnv } from '../lib/env';

const validEnv = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  DIRECT_URL: 'postgresql://user:pass@localhost:5432/db',
  BETTER_AUTH_SECRET: 'secret',
  BETTER_AUTH_URL: 'http://localhost:3000',
  GOOGLE_CLIENT_ID: 'google-id',
  GOOGLE_CLIENT_SECRET: 'google-secret',
  GITHUB_CLIENT_ID: 'github-id',
  GITHUB_CLIENT_SECRET: 'github-secret',
  DISCORD_CLIENT_ID: 'discord-id',
  DISCORD_CLIENT_SECRET: 'discord-secret',
  CRON_SECRET: 'cron-secret',
  CLOUDFLARE_ACCOUNT_ID: 'account',
  CLOUDFLARE_API_TOKEN: 'token',
};

describe('environment schema', () => {
  it('accepts the PRD-named variables', () => {
    expect(parseEnv(validEnv)).toMatchObject({ CRON_SECRET: 'cron-secret' });
  });

  it('rejects a missing PRD-named variable', () => {
    const missing: Record<string, unknown> = { ...validEnv };
    delete missing.CRON_SECRET;
    expect(() => parseEnv(missing)).toThrow('CRON_SECRET');
  });
});
