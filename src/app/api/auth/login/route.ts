import { prisma } from '../../../../lib/prisma';
import { setSessionCookie, signToken } from '../../../../lib/auth';
import bcrypt from 'bcrypt';

export const rateLimitStore = new Map<string, number>();

export const POST = async (req: Request): Promise<Response> => {
  const ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const attempts = rateLimitStore.get(ip) || 0;

  if (attempts >= 5) {
    return new Response(JSON.stringify({ error: 'Too many login attempts. Please try again later.' }), { status: 429 });
  }

  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid input format' }), { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      rateLimitStore.set(ip, attempts + 1);
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      rateLimitStore.set(ip, attempts + 1);
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    const token = signToken({ userId: user.id, email: user.email });
    await setSessionCookie(token);

    rateLimitStore.delete(ip);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    console.error('Login Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Bad Request' }), { status: 400 });
  }
};
