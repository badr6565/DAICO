import { prisma } from '../../../../lib/prisma';
import { setSessionCookie, signToken } from '../../../../lib/auth';
import bcrypt from 'bcrypt';

export const signupRateLimitStore = new Map<string, number>();

export const POST = async (req: Request): Promise<Response> => {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const attempts = signupRateLimitStore.get(ip) || 0;

  if (attempts >= 5) {
    return new Response(JSON.stringify({ error: 'Too many signup attempts. Please try again later.' }), { status: 429 });
  }

  try {
    signupRateLimitStore.set(ip, attempts + 1);

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
    }

    if (password.length < 8) {
      return new Response(JSON.stringify({ error: 'Password must be at least 8 characters long.' }), { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Email already in use' }), { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    const token = signToken({ userId: newUser.id, email: newUser.email });
    await setSessionCookie(token);

    signupRateLimitStore.delete(ip);
    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (err: any) {
    console.error('Signup Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Bad Request' }), { status: 400 });
  }
};
