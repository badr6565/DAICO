import { prisma } from '../../../lib/prisma';
import { getSessionUser } from '../../../lib/auth';

export const GET = async (req: Request): Promise<Response> => {
  const user = await getSessionUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
    });
    return new Response(JSON.stringify(tasks), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch tasks' }), { status: 500 });
  }
};

export const POST = async (req: Request): Promise<Response> => {
  const user = await getSessionUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await req.json();
    const { title } = body;

    if (!title || typeof title !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid title' }), { status: 400 });
    }

    const newTask = await prisma.task.create({
      data: {
        title: title.trim(),
        userId: user.userId,
      },
    });

    return new Response(JSON.stringify(newTask), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create task' }), { status: 500 });
  }
};
