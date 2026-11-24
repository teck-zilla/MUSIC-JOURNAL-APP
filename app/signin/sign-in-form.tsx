'use client';

import { useState } from 'react';
import { createAuthClient } from 'better-auth/react';

const authClient = createAuthClient();

const providers = [
  { id: 'google', label: 'Continue with Google' },
  { id: 'github', label: 'Continue with GitHub' },
  { id: 'discord', label: 'Continue with Discord' },
] as const;

export function SignInForm() {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);

  async function signIn(provider: 'google' | 'github' | 'discord') {
    if (!ageConfirmed) return;
    setError(null);
    setPendingProvider(provider);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: '/',
      });
    } catch {
      setError('Sign in could not start. Please try again.');
      setPendingProvider(null);
    }
  }

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={ageConfirmed}
          onChange={(event) => setAgeConfirmed(event.target.checked)}
        />{' '}
        I am 13 or older
      </label>

      <div>
        {providers.map((provider) => (
          <button
            key={provider.id}
            type="button"
            disabled={!ageConfirmed || pendingProvider !== null}
            onClick={() => void signIn(provider.id)}
          >
            {pendingProvider === provider.id ? 'Redirecting...' : provider.label}
          </button>
        ))}
      </div>

      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}
