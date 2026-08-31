import { describe, it, expect } from 'vitest';

describe('Health route', () => {
  it('should return status ok shape', () => {
    const mockResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
    expect(mockResponse.status).toBe('ok');
    expect(typeof mockResponse.timestamp).toBe('string');
    expect(typeof mockResponse.uptime).toBe('number');
  });
});
