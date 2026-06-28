import { auth } from "@clerk/nextjs/server"
import { type NextRequest } from "next/server"
import { revalidateTag } from "next/cache"
import prisma from "@/lib/prisma"
import { projectsCacheTag } from "@/lib/projects"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  })

  return Response.json(projects)
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const name = (body?.name as string | undefined)?.trim() || "Untitled Project"
  const id = (body?.id as string | undefined)?.trim() || undefined

  const project = await prisma.project.create({
    data: { ...(id ? { id } : {}), ownerId: userId, name },
  })

  revalidateTag(projectsCacheTag(userId), 'default')
  return Response.json(project, { status: 201 })
}
