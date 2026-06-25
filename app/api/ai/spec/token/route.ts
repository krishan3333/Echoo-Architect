import { NextRequest } from "next/server";
import { auth as triggerAuth } from "@trigger.dev/sdk/v3";
import prisma from "@/lib/prisma";
import { getCurrentIdentity } from "@/lib/project-access";

export async function POST(request: NextRequest) {
  const identity = await getCurrentIdentity();
  if (!identity) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { runId } = body as { runId?: string };

  if (!runId) return Response.json({ error: "Missing runId" }, { status: 400 });

  const taskRun = await prisma.taskRun.findUnique({ where: { runId } });
  if (!taskRun) return Response.json({ error: "Not found" }, { status: 404 });
  if (taskRun.userId !== identity.userId) return Response.json({ error: "Forbidden" }, { status: 403 });

  const token = await triggerAuth.createPublicToken({
    scopes: { read: { runs: [runId] } },
    expirationTime: "1h",
  });

  return Response.json({ token });
}
