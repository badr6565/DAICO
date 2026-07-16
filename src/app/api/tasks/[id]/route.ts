import { prisma } from '../../../../lib/prisma';
import { getSessionUser } from '../../../../lib/auth';

export const PUT = async (req: Request, { params }: { params: { id: string } }): Promise<Response> => {
  const user = await getSessionUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { id } = params;
    
    // IDOR Prevention: Verify the task belongs to the user
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      return new Response(JSON.stringify({ error: 'Task not found' }), { status: 404 });
    }
    if (existingTask.userId !== user.userId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { completed: !existingTask.completed },
    });

    return new Response(JSON.stringify(updatedTask), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update task' }), { status: 500 });
  }
};

export const DELETE = async (req: Request, { params }: { params: { id: string } }): Promise<Response> => {
  const user = await getSessionUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { id } = params;
    
    // IDOR Prevention: Verify the task belongs to the user
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      return new Response(JSON.stringify({ error: 'Task not found' }), { status: 404 });
    }
    if (existingTask.userId !== user.userId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    await prisma.task.delete({ where: { id } });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete task' }), { status: 500 });
  }
};
