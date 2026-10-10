import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeApiErrorPayload } from '../src/services/api/normalizeApiError.ts';

test('uses FastAPI HTTPException detail as the user-facing message', () => {
  assert.deepEqual(
    normalizeApiErrorPayload({ detail: 'Invalid email or password.' }, 'request failed'),
    { message: 'Invalid email or password.', details: undefined },
  );
});

test('preserves the backend validation message and string field errors', () => {
  assert.deepEqual(
    normalizeApiErrorPayload(
      { message: 'Request validation failed.', errors: { email: ['Invalid email address.'] } },
      'request failed',
    ),
    {
      message: 'Request validation failed.',
      details: { email: ['Invalid email address.'] },
    },
  );
});

test('does not stringify or expose structured detail payloads', () => {
  assert.deepEqual(
    normalizeApiErrorPayload({ detail: { database: 'unavailable' } }, 'request failed'),
    { message: 'request failed', details: undefined },
  );
});

test('uses the transport fallback for unknown error payloads', () => {
  assert.deepEqual(normalizeApiErrorPayload(null, 'network unavailable'), {
    message: 'network unavailable',
  });
});