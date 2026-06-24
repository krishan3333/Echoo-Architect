import { type NextRequest } from "next/server"
import { get, put } from "@vercel/blob"
import prisma from "@/lib/prisma"
import { getCurrentIdentity, getProjectWithAccess } from "@/lib/project-access"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const identity = await getCurrentIdentity()
  if (!identity) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params
  const access = await getProjectWithAccess(projectId, identity)
  if (!access) return Response.json({ error: "Not found" }, { status: 404 })

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { canvasJsonPath: true },
  })

  if (!project?.canvasJsonPath) {
    return Response.json({ nodes: [], edges: [] })
  }

  const result = await get(project.canvasJsonPath, { access: "private" })
  if (!result || result.statusCode !== 200 || !result.stream) {
    return Response.json({ nodes: [], edges: [] })
  }

  const text = await new Response(result.stream).text()
  const canvas = JSON.parse(text)
  return Response.json(canvas)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const identity = await getCurrentIdentity()
    if (!identity) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { projectId } = await params
    const access = await getProjectWithAccess(projectId, identity)
    if (!access) return Response.json({ error: "Not found" }, { status: 404 })

    const canvas = await request.json()

    const blob = await put(`canvas/${projectId}.json`, JSON.stringify(canvas), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    })

    await prisma.project.update({
      where: { id: projectId },
      data: { canvasJsonPath: blob.url },
    })

    return Response.json({ url: blob.url })
  } catch (err) {
    console.error("[canvas PUT]", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
