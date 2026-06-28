import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import prisma from "@/lib/prisma";
import type { designAgent } from "@/trigger/design-agent";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { prompt, roomId, projectId } = body as {
    prompt?: string;
    roomId?: string;
    projectId?: string;
  };

  if (!prompt || !roomId || !projectId) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const project = await prisma.project.findFirst({ where: { id: projectId } });
  if (!project) return Response.json({ error: "Not found" }, { status: 404 });

  const handle = await tasks.trigger<typeof designAgent>("design-agent", { prompt, roomId, triggeredBy: userId });

  await prisma.taskRun.create({
    data: { runId: handle.id, projectId, userId },
  });

  return Response.json({ runId: handle.id }, { status: 201 });
}
