import { auth } from "@clerk/nextjs/server"
import { type NextRequest } from "next/server"
import prisma from "@/lib/prisma"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string; collaboratorId: string }> }
) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId, collaboratorId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  })
  if (!project) return Response.json({ error: "Not found" }, { status: 404 })
  if (project.ownerId !== userId) return Response.json({ error: "Forbidden" }, { status: 403 })

  const collab = await prisma.projectCollaborator.findUnique({
    where: { id: collaboratorId },
    select: { id: true, projectId: true },
  })
  if (!collab || collab.projectId !== projectId) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.projectCollaborator.delete({ where: { id: collaboratorId } })

  return new Response(null, { status: 204 })
}
