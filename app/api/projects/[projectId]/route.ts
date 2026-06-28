import { auth } from "@clerk/nextjs/server"
import { type NextRequest } from "next/server"
import { revalidateTag } from "next/cache"
import prisma from "@/lib/prisma"
import { projectsCacheTag } from "@/lib/projects"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params
  const project = await prisma.project.findUnique({ where: { id: projectId } })

  if (!project) return Response.json({ error: "Not found" }, { status: 404 })
  if (project.ownerId !== userId) return Response.json({ error: "Forbidden" }, { status: 403 })

  const body = await request.json()
  const name = (body?.name as string | undefined)?.trim()
  if (!name) return Response.json({ error: "Name is required" }, { status: 400 })

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { name },
  })

  revalidateTag(projectsCacheTag(userId), 'default')
  return Response.json(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params
  const project = await prisma.project.findUnique({ where: { id: projectId } })

  if (!project) return Response.json({ error: "Not found" }, { status: 404 })
  if (project.ownerId !== userId) return Response.json({ error: "Forbidden" }, { status: 403 })

  await prisma.project.delete({ where: { id: projectId } })

  revalidateTag(projectsCacheTag(userId), 'default')
  return new Response(null, { status: 204 })
}
