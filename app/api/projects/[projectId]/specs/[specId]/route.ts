import { type NextRequest } from "next/server"
import { get } from "@vercel/blob"
import prisma from "@/lib/prisma"
import { getCurrentIdentity, getProjectWithAccess } from "@/lib/project-access"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string; specId: string }> }
) {
  const identity = await getCurrentIdentity()
  if (!identity) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId, specId } = await params

  const access = await getProjectWithAccess(projectId, identity)
  if (!access) return Response.json({ error: "Forbidden" }, { status: 403 })

  const spec = await prisma.projectSpec.findUnique({
    where: { id: specId },
    select: { projectId: true, filePath: true },
  })

  if (!spec) return Response.json({ error: "Not found" }, { status: 404 })
  if (spec.projectId !== projectId) return Response.json({ error: "Forbidden" }, { status: 403 })

  const result = await get(spec.filePath, { access: "private" })
  if (!result || result.statusCode !== 200 || !result.stream) {
    return Response.json({ error: "File not found" }, { status: 404 })
  }

  const content = await new Response(result.stream).text()
  return Response.json({ content })
}
