import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VaultumClient, VaultumError } from '../src/client';
import type { QuoteRequest, SubmitRequest, UserOperation } from '../src/types';

// Mock cross-fetch module
vi.mock('cross-fetch', () => ({
  default: vi.fn()
}));

// Import after mock is set up
import fetch from 'cross-fetch';
const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;

describe('VaultumClient', () => {
  let client: VaultumClient;

  beforeEach(() => {
    client = new VaultumClient({
      baseUrl: 'http://localhost:8000',
      headers: { 'X-API-Key': 'test-key' },
      timeout: 5000
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should remove trailing slash from baseUrl', () => {
      const clientWithSlash = new VaultumClient({
        baseUrl: 'http://localhost:8000/',
      });
      // Test by making a request and checking the URL
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'test' })
      });
      clientWithSlash.getOpStatus('550e8400-e29b-41d4-a716-446655440000');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:8000/api/op/'),
        expect.any(Object)
      );
    });

    it('should merge custom headers with defaults', () => {
      const clientWithHeaders = new VaultumClient({
        baseUrl: 'http://localhost:8000',
        headers: {
          'X-Custom-Header': 'custom-value',
          'Content-Type': 'application/xml' // Should override default
        }
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ estimatedFee: '1000' })
      });
      const request: QuoteRequest = {
        fromChain: 'ethereum',
        toChain: 'polygon',
        token: '0x0000000000000000000000000000000000000000',
        amount: '1000000000000000000'
      };
      clientWithHeaders.quoteOp(request);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value',
            'Content-Type': 'application/xml',
            'Accept': 'application/json'
          })
        })
      );
    });
  });

  describe('quoteOp', () => {
    it('should successfully get a quote', async () => {
      const request: QuoteRequest = {
        fromChain: 'ethereum',
        toChain: 'polygon',
        token: '0x0000000000000000000000000000000000000000',
        amount: '1000000000000000000'
      };

      const mockResponse = {
        estimatedFee: '50000000000000000',
        route: {
          path: ['ethereum', 'polygon'],
          bridges: ['hop'],
          estimatedTime: 300
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      const result = await client.quoteOp(request);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/op/quote',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-API-Key': 'test-key'
          }),
          body: JSON.stringify(request),
          signal: expect.any(AbortSignal)
        })
      );
    });

    it('should handle validation errors (422)', async () => {
      const request: QuoteRequest = {
        fromChain: 'invalid' as any,
        toChain: 'polygon',
        token: 'not-an-address',
        amount: 'invalid-amount'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({
          message: 'The given data was invalid.',
          errors: {
            fromChain: ['The fromChain must be one of: ethereum, polygon, arbitrum'],
            token: ['The token must be a valid Ethereum address'],
            amount: ['The amount must be a numeric string']
          }
        })
      });

      try {
        await client.quoteOp(request);
        expect.fail('Should have thrown VaultumError');
      } catch (error) {
        expect(error).toBeInstanceOf(VaultumError);
        expect(error).toMatchObject({
          message: 'The given data was invalid.',
          statusCode: 422,
          errors: {
            fromChain: ['The fromChain must be one of: ethereum, polygon, arbitrum'],
            token: ['The token must be a valid Ethereum address'],
            amount: ['The amount must be a numeric string']
          }
        });
      }
    });

    it('should handle 400 bad request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Bad request: missing required fields'
        })
      });

      try {
        await client.quoteOp({} as QuoteRequest);
        expect.fail('Should have thrown VaultumError');
      } catch (error) {
        expect(error).toBeInstanceOf(VaultumError);
        expect(error).toMatchObject({
          message: 'Bad request: missing required fields',
          statusCode: 400
        });
      }
    });

    it('should handle 500 internal server error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'Internal server error'
        })
      });

      const request: QuoteRequest = {
        fromChain: 'ethereum',
        toChain: 'polygon',
        token: '0x0000000000000000000000000000000000000000',
        amount: '1000000000000000000'
      };

      try {
        await client.quoteOp(request);
        expect.fail('Should have thrown VaultumError');
      } catch (error) {
        expect(error).toBeInstanceOf(VaultumError);
        expect(error).toMatchObject({
          message: 'Internal server error',
          statusCode: 500
        });
      }
    });

    it('should handle non-JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      const request: QuoteRequest = {
        fromChain: 'ethereum',
        toChain: 'polygon',
        token: '0x0000000000000000000000000000000000000000',
        amount: '1000000000000000000'
      };

      await expect(client.quoteOp(request)).rejects.toThrow(VaultumError);
    });
  });

  describe('submitOp', () => {
    it('should successfully submit an operation', async () => {
      const userOp: UserOperation = {
        sender: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        nonce: '0',
        initCode: '0x',
        callData: '0xb61d27f6000000000000000000000000',
        callGasLimit: '100000',
        verificationGasLimit: '100000',
        preVerificationGas: '21000',
        maxFeePerGas: '1000000000',
        maxPriorityFeePerGas: '1000000000',
        paymasterAndData: '0x'
      };

      const request: SubmitRequest = {
        chain: 'ethereum',
        userOp,
        signature: '0x' + 'a'.repeat(130)
      };

      const mockResponse = {
        id: '550e8400-e29b-41d4-a716-446655440000'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      const result = await client.submitOp(request);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/op/submit',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(request)
        })
      );
    });

    it('should handle validation error for invalid signature', async () => {
      const request: SubmitRequest = {
        chain: 'ethereum',
        userOp: {} as UserOperation,
        signature: 'invalid-signature'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({
          message: 'Validation failed',
          errors: {
            signature: ['The signature must be a valid hex string with 0x prefix']
          }
        })
      });

      try {
        await client.submitOp(request);
        expect.fail('Should have thrown VaultumError');
      } catch (error) {
        expect(error).toBeInstanceOf(VaultumError);
        expect(error).toMatchObject({
          statusCode: 422,
          errors: {
            signature: ['The signature must be a valid hex string with 0x prefix']
          }
        });
      }
    });

    it('should handle 403 forbidden', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          error: 'Forbidden: API key invalid'
        })
      });

      try {
        await client.submitOp({} as SubmitRequest);
        expect.fail('Should have thrown VaultumError');
      } catch (error) {
        expect(error).toBeInstanceOf(VaultumError);
        expect(error).toMatchObject({
          message: 'Forbidden: API key invalid',
          statusCode: 403
        });
      }
    });
  });

  describe('getOpStatus', () => {
    it('should successfully get operation status', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';

      const mockResponse = {
        id,
        state: 'sent' as const,
        txHash: '0x' + 'a'.repeat(64)
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      const result = await client.getOpStatus(id);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/op/${id}`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Accept': 'application/json'
          })
        })
      );
    });

    it('should validate UUID format before making request', async () => {
      const invalidIds = [
        '',
        'not-a-uuid',
        '550e8400-e29b-41d4-a716',
        '550e8400e29b41d4a716446655440000',
        'g50e8400-e29b-41d4-a716-446655440000', // Invalid hex char
        '550e8400-e29b-41d4-a716-446655440000-extra'
      ];

      for (const id of invalidIds) {
        await expect(client.getOpStatus(id)).rejects.toThrow('Invalid operation ID format');
      }

      // Ensure fetch was never called
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle 404 not found', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: 'Operation not found'
        })
      });

      try {
        await client.getOpStatus(id);
        expect.fail('Should have thrown VaultumError');
      } catch (error) {
        expect(error).toBeInstanceOf(VaultumError);
        expect(error).toMatchObject({
          message: 'Operation not found',
          statusCode: 404
        });
      }
    });

    it('should handle status with null txHash', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';

      const mockResponse = {
        id,
        state: 'queued' as const,
        txHash: null
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      const result = await client.getOpStatus(id);

      expect(result).toEqual(mockResponse);
      expect(result.txHash).toBeNull();
    });
  });

  describe('waitForOperation', () => {
    it('should poll until success state', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id, state: 'queued', txHash: null })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id, state: 'sent', txHash: '0x123' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id, state: 'success', txHash: '0x123' })
        });

      const onStatusChange = vi.fn();
      const result = await client.waitForOperation(id, {
        pollingInterval: 10,
        onStatusChange
      });

      expect(result.state).toBe('success');
      expect(onStatusChange).toHaveBeenCalledTimes(3);
      expect(onStatusChange).toHaveBeenNthCalledWith(1, { id, state: 'queued', txHash: null });
      expect(onStatusChange).toHaveBeenNthCalledWith(2, { id, state: 'sent', txHash: '0x123' });
      expect(onStatusChange).toHaveBeenNthCalledWith(3, { id, state: 'success', txHash: '0x123' });
    });

    it('should poll until failed state', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id, state: 'queued', txHash: null })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id, state: 'failed', txHash: null })
        });

      const result = await client.waitForOperation(id, {
        pollingInterval: 10
      });

      expect(result.state).toBe('failed');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should timeout after max attempts', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id, state: 'queued', txHash: null })
      });

      await expect(
        client.waitForOperation(id, {
          pollingInterval: 10,
          maxAttempts: 3
        })
      ).rejects.toThrow('Operation timeout: max attempts reached');

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should use default options', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id, state: 'success', txHash: '0x123' })
      });

      const result = await client.waitForOperation(id);

      expect(result.state).toBe('success');
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error: ECONNREFUSED'));

      try {
        await client.getOpStatus('550e8400-e29b-41d4-a716-446655440000');
        expect.fail('Should have thrown VaultumError');
      } catch (error) {
        expect(error).toBeInstanceOf(VaultumError);
        expect(error).toMatchObject({
          message: 'Network error: ECONNREFUSED'
        });
      }
    });

    it('should handle timeout with AbortController', async () => {
      const timeoutClient = new VaultumClient({
        baseUrl: 'http://localhost:8000',
        timeout: 50
      });

      // Mock fetch to delay longer than timeout
      mockFetch.mockImplementationOnce((url, options) => {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ id: 'test' })
            });
          }, 200);
          
          // Listen for abort signal
          if (options?.signal) {
            options.signal.addEventListener('abort', () => {
              clearTimeout(timeout);
              const error = new Error('The operation was aborted');
              (error as any).name = 'AbortError';
              reject(error);
            });
          }
        });
      });

      // This should timeout
      await expect(
        timeoutClient.getOpStatus('550e8400-e29b-41d4-a716-446655440000')
      ).rejects.toThrow('Request timeout');
    });

    it('should handle JSON parse errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new SyntaxError('Unexpected token < in JSON at position 0');
        }
      });

      await expect(client.getOpStatus('550e8400-e29b-41d4-a716-446655440000'))
        .rejects.toThrow(VaultumError);
    });

    it('should preserve VaultumError when re-thrown', async () => {
      mockFetch.mockRejectedValueOnce(new VaultumError('Custom error', 400));

      try {
        await client.getOpStatus('550e8400-e29b-41d4-a716-446655440000');
        expect.fail('Should have thrown VaultumError');
      } catch (error) {
        expect(error).toBeInstanceOf(VaultumError);
        expect(error).toMatchObject({
          message: 'Custom error',
          statusCode: 400
        });
      }
    });

    it('should handle non-Error objects thrown', async () => {
      mockFetch.mockRejectedValueOnce('String error');

      try {
        await client.getOpStatus('550e8400-e29b-41d4-a716-446655440000');
        expect.fail('Should have thrown VaultumError');
      } catch (error) {
        expect(error).toBeInstanceOf(VaultumError);
        expect(error).toMatchObject({
          message: 'Unknown error occurred'
        });
      }
    });

    it('should handle validation error with missing message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({
          errors: {
            field: ['Error without message']
          }
        })
      });

      await expect(client.getOpStatus('550e8400-e29b-41d4-a716-446655440000'))
        .rejects.toMatchObject({
          message: 'Validation failed',
          statusCode: 422,
          errors: {
            field: ['Error without message']
          }
        });
    });

    it('should handle generic error response with missing error field', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({})
      });

      await expect(client.getOpStatus('550e8400-e29b-41d4-a716-446655440000'))
        .rejects.toMatchObject({
          message: 'Request failed with status 400',
          statusCode: 400
        });
    });
  });

  describe('VaultumError', () => {
    it('should create error with all properties', () => {
      const error = new VaultumError('Test error', 400, { field: ['error1', 'error2'] });
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('VaultumError');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.errors).toEqual({ field: ['error1', 'error2'] });
    });

    it('should create error with only message', () => {
      const error = new VaultumError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBeUndefined();
      expect(error.errors).toBeUndefined();
    });
  });
});
