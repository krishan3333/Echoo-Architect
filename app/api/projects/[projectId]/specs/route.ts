import { type NextRequest } from "next/server"
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
  if (!access) return Response.json({ error: "Forbidden" }, { status: 403 })

  const specs = await prisma.projectSpec.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: { id: true, filePath: true, createdAt: true },
  })

  return Response.json({
    specs: specs.map((s) => {
      let filename = "spec.md"
      try {
        filename = new URL(s.filePath).pathname.split("/").pop() ?? "spec.md"
      } catch {
        filename = s.filePath.split("/").pop() ?? "spec.md"
      }
      return { id: s.id, filename, createdAt: s.createdAt }
    }),
  })
}
