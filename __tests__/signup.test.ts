/**
 * TDD Phase: RED
 * Writing unit and security tests for the signup functionality.
 */

import { POST, signupRateLimitStore } from '../src/app/api/auth/signup/route';

describe('Signup API Security and Unit Tests', () => {
  beforeEach(() => {
    signupRateLimitStore.clear();
  });

  const createMockRequest = (body: any, ip: string = Math.random().toString()) => {
    return new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify(body),
    });
  };

  it('1. Password Strength - should reject passwords shorter than 8 characters', async () => {
    const req = createMockRequest({ email: 'newuser@example.com', password: 'short' });
    const res = await POST(req);
    
    expect(res.status).toBe(400);
    const json = await res.json().catch(() => ({}));
    expect(json.error).toMatch(/password must be at least 8 characters/i);
  });

  it('2. Duplicate User Check - should return generic error or specific error for existing email', async () => {
    // We assume 'validuser@example.com' already exists from our login tests
    const req = createMockRequest({ email: 'validuser@example.com', password: 'strongpassword123' });
    const res = await POST(req);
    
    expect(res.status).toBe(409); // Conflict
    const json = await res.json().catch(() => ({}));
    expect(json.error).toBe('Email already in use');
  });

  it('3. Rate Limiting Test - should lock out after 3 failed/successful attempts to prevent mass creation', async () => {
    const ip = '192.168.1.100'; // Fixed IP to trigger rate limit

    // 3 attempts
    for (let i = 0; i < 3; i++) {
      const req = createMockRequest({ email: `test${i}@example.com`, password: 'strongpassword123' }, ip);
      await POST(req); 
    }

    // 4th attempt should be rate limited
    const req = createMockRequest({ email: 'test4@example.com', password: 'strongpassword123' }, ip);
    const res = await POST(req);

    expect(res.status).toBe(429);
  });

  it('4. Valid Signup - should return 201 Created and a token/session', async () => {
    const req = createMockRequest({ email: 'brandnewuser@example.com', password: 'strongpassword123' });
    const res = await POST(req);
    
    expect(res.status).toBe(201);
    const json = await res.json().catch(() => ({}));
    expect(json).toHaveProperty('token');
  });

});
