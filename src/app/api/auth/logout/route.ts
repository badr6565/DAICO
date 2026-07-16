import { clearSessionCookie } from '../../../../lib/auth';

export const POST = async (): Promise<Response> => {
  await clearSessionCookie();
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
