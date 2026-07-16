/**
 * TDD Phase: RED
 * Writing unit and security tests for the login functionality.
 */

import { POST, rateLimitStore } from '../src/app/api/auth/login/route';

describe('Login API Security and Unit Tests', () => {

  beforeEach(() => {
    rateLimitStore.clear();
  });

  const createMockRequest = (body: any) => {
    return new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  it('1. SQL/NoSQL Injection Attempt - should reject payload and return 400/401', async () => {
    const maliciousBody = {
      email: { "$gt": "" }, // NoSQL injection payload
      password: "' OR '1'='1" // SQL injection payload
    };

    const req = createMockRequest(maliciousBody);
    const res = await POST(req);
    
    // The endpoint should catch invalid types (not strings) and SQL syntax
    // Returning generic error or bad request.
    expect([400, 401]).toContain(res.status);
    
    const json = await res.json().catch(() => ({}));
    if (res.status === 401) {
      expect(json.error).toBe('Invalid credentials');
    }
  });

  it('2. Rate Limiting Test - should lock out after 5 failed attempts and return 429', async () => {
    const invalidBody = { email: 'test@example.com', password: 'wrongpassword' };
    
    // Simulate 5 failed attempts
    for (let i = 0; i < 5; i++) {
      const req = createMockRequest(invalidBody);
      await POST(req); // Assuming these will fail and decrement rate limit
    }

    // 6th attempt should be rate limited
    const req = createMockRequest(invalidBody);
    const res = await POST(req);

    expect(res.status).toBe(429); // Too Many Requests
    const json = await res.json().catch(() => ({}));
    expect(json.error).toBe('Too many login attempts. Please try again later.');
  });

  it('2.5. Rate Limiting Spoofing Test - should not allow bypass via x-forwarded-for spoofing', async () => {
    const invalidBody = { email: 'test@example.com', password: 'wrongpassword' };
    
    // Simulate 5 failed attempts from the same underlying IP (x-real-ip) but spoofed x-forwarded-for
    for (let i = 0; i < 5; i++) {
      const req = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-forwarded-for': `192.168.1.${i}`, // Attacker spoofs this
          'x-real-ip': '10.0.0.1'              // Real IP set by our proxy
        },
        body: JSON.stringify(invalidBody),
      });
      // @ts-ignore
      await POST(req); 
    }

    // 6th attempt should be blocked because the real IP is the same
    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-forwarded-for': `192.168.1.99`,
        'x-real-ip': '10.0.0.1'
      },
      body: JSON.stringify(invalidBody),
    });
    // @ts-ignore
    const res = await POST(req);

    expect(res.status).toBe(429);
  });

  it('3. Auth Bypass Attempt - should reject request with missing fields', async () => {
    // Missing password
    const req1 = createMockRequest({ email: 'test@example.com' });
    const res1 = await POST(req1);
    expect([400, 401]).toContain(res1.status);

    // Missing email
    const req2 = createMockRequest({ password: 'password123' });
    const res2 = await POST(req2);
    expect([400, 401]).toContain(res2.status);
  });

  it('4. Generic Error Messages - should return identical generic errors for wrong email or wrong password', async () => {
    const req1 = createMockRequest({ email: 'nonexistent@example.com', password: 'password123' });
    const res1 = await POST(req1);
    expect(res1.status).toBe(401);
    const json1 = await res1.json().catch(() => ({}));
    expect(json1.error).toBe('Invalid credentials');

    const req2 = createMockRequest({ email: 'validuser@example.com', password: 'wrongpassword' });
    const res2 = await POST(req2);
    expect(res2.status).toBe(401);
    const json2 = await res2.json().catch(() => ({}));
    expect(json2.error).toBe('Invalid credentials');
  });

});
