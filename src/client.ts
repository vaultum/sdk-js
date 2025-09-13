import fetch from 'cross-fetch';
import type {
  VaultumClientOptions,
  QuoteRequest,
  QuoteResponse,
  SubmitRequest,
  SubmitResponse,
  StatusResponse,
  ErrorResponse,
  ValidationErrorResponse
} from './types';

export class VaultumError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'VaultumError';
  }
}

export class VaultumClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private timeout: number;

  constructor(options: VaultumClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };
    this.timeout = options.timeout || 30000;
  }

  /**
   * Make an HTTP request with timeout support
   */
  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: this.headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 422) {
          const validationError = responseData as ValidationErrorResponse;
          throw new VaultumError(
            validationError.message || 'Validation failed',
            response.status,
            validationError.errors
          );
        }

        const errorResponse = responseData as ErrorResponse;
        throw new VaultumError(
          errorResponse.error || `Request failed with status ${response.status}`,
          response.status
        );
      }

      return responseData as T;
    } catch (error) {
      if (error instanceof VaultumError) {
        throw error;
      }
      
      if ((error as any).name === 'AbortError') {
        throw new VaultumError('Request timeout');
      }

      throw new VaultumError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }

  /**
   * Get a quote for a cross-chain operation
   */
  async quoteOp(request: QuoteRequest): Promise<QuoteResponse> {
    return this.request<QuoteResponse>('POST', '/api/op/quote', request);
  }

  /**
   * Submit a UserOperation for execution
   */
  async submitOp(request: SubmitRequest): Promise<SubmitResponse> {
    return this.request<SubmitResponse>('POST', '/api/op/submit', request);
  }

  /**
   * Get the status of a submitted operation
   */
  async getOpStatus(id: string): Promise<StatusResponse> {
    if (!id || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id)) {
      throw new VaultumError('Invalid operation ID format');
    }
    return this.request<StatusResponse>('GET', `/api/op/${id}`);
  }

  /**
   * Wait for an operation to complete
   * @param id Operation ID
   * @param options Polling options
   */
  async waitForOperation(
    id: string,
    options: {
      pollingInterval?: number;
      maxAttempts?: number;
      onStatusChange?: (status: StatusResponse) => void;
    } = {}
  ): Promise<StatusResponse> {
    const pollingInterval = options.pollingInterval || 2000;
    const maxAttempts = options.maxAttempts || 60;

    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getOpStatus(id);
      
      if (options.onStatusChange) {
        options.onStatusChange(status);
      }

      if (status.state === 'success' || status.state === 'failed') {
        return status;
      }

      await new Promise(resolve => setTimeout(resolve, pollingInterval));
    }

    throw new VaultumError('Operation timeout: max attempts reached');
  }
}

export type WaitOptions = {
  intervalMs?: number,
  timeoutMs?: number,
  onTick?: (state: string) => void
};

export async function waitForOp(baseUrl: string, id: string, opts: WaitOptions = {}): Promise<{ id: string, state: string, txHash?: string }> {
  const started = Date.now();
  const interval = opts.intervalMs ?? 1500;
  const timeout = opts.timeoutMs ?? 120000;
  const fetchFn = typeof globalThis !== 'undefined' && globalThis.fetch ? globalThis.fetch : fetch;

  while (true) {
    const r = await fetchFn(`${baseUrl}/op/${id}`);
    if (r.status === 404) throw new Error('Operation not found');
    const j = await r.json();
    const state = j.state as string;
    if (opts.onTick) opts.onTick(state);
    if (state === 'success' || state === 'failed') {
      return j;
    }
    if (Date.now() - started > timeout) {
      throw new Error('Timeout waiting for operation');
    }
    await new Promise(res => setTimeout(res, interval));
  }
}
