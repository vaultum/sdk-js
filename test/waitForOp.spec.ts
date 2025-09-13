import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitForOp } from '../src/client';

describe('waitForOp', () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('polls until terminal state', async () => {
    const base = 'http://localhost:9999';

    const seq = [
      { state: 'queued', id: 'op_test' },
      { state: 'sent', id: 'op_test' },
      { state: 'success', id: 'op_test', txHash: '0xabc' },
    ];
    let calls = 0;

    // @ts-ignore
    global.fetch = vi.fn(async (url: string) => {
      const response = seq[Math.min(calls, seq.length - 1)];
      calls++;
      return {
        status: 200,
        async json() { return response; }
      };
    });

    const res = await waitForOp(base, 'op_test', { intervalMs: 10, timeoutMs: 1000 });
    expect(res.state).toBe('success');
    expect(res.txHash).toBe('0xabc');
  });
});
