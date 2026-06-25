import { NextRequest } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import prisma from "@/lib/prisma";
import { getCurrentIdentity, getProjectWithAccess } from "@/lib/project-access";
import type { generateSpec } from "@/trigger/generate-spec";

export async function POST(request: NextRequest) {
  const identity = await getCurrentIdentity();
  if (!identity) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { roomId, chatHistory, nodes, edges } = body as {
    roomId?: string;
    chatHistory?: any[];
    nodes?: any[];
    edges?: any[];
  };

  if (!roomId) {
    return Response.json({ error: "Missing roomId" }, { status: 400 });
  }

  const project = await getProjectWithAccess(roomId, identity);
  if (!project) return Response.json({ error: "Not found" }, { status: 404 });

  const handle = await tasks.trigger<typeof generateSpec>("generate-spec", {
    projectId: project.id,
    roomId,
    chatHistory: chatHistory ?? [],
    nodes: nodes ?? [],
    edges: edges ?? [],
  });

  await prisma.taskRun.create({
    data: { runId: handle.id, projectId: project.id, userId: identity.userId },
  });

  return Response.json({ runId: handle.id }, { status: 201 });
}
