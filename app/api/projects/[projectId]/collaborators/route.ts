import { auth } from "@clerk/nextjs/server"
import { clerkClient } from "@clerk/nextjs/server"
import { type NextRequest } from "next/server"
import prisma from "@/lib/prisma"

async function getProjectAndVerifyAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  })
  if (!project) return null

  if (project.ownerId === userId) return { project, isOwner: true }

  const user = await auth()
  const clerkUser = user ? await (await clerkClient()).users.getUser(userId) : null
  const email = clerkUser?.emailAddresses[0]?.emailAddress

  if (email) {
    const collab = await prisma.projectCollaborator.findUnique({
      where: { projectId_email: { projectId, email } },
      select: { id: true },
    })
    if (collab) return { project, isOwner: false }
  }

  return null
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  })
  if (!project) return Response.json({ error: "Not found" }, { status: 404 })

  const isOwner = project.ownerId === userId

  // verify collaborator access if not owner
  if (!isOwner) {
    const clerkUser = await (await clerkClient()).users.getUser(userId)
    const email = clerkUser?.emailAddresses[0]?.emailAddress
    if (!email) return Response.json({ error: "Forbidden" }, { status: 403 })

    const collab = await prisma.projectCollaborator.findUnique({
      where: { projectId_email: { projectId, email } },
      select: { id: true },
    })
    if (!collab) return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const rows = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true },
  })

  // Enrich with Clerk user data
  const emails = rows.map((r) => r.email)
  let clerkUsers: Array<{ emailAddresses: Array<{ emailAddress: string }>; firstName: string | null; lastName: string | null; imageUrl: string }> = []

  if (emails.length > 0) {
    const result = await (await clerkClient()).users.getUserList({ emailAddress: emails })
    clerkUsers = result.data
  }

  const emailToClerk = new Map(
    clerkUsers.flatMap((u) =>
      u.emailAddresses.map((e) => [
        e.emailAddress,
        {
          name: [u.firstName, u.lastName].filter(Boolean).join(" ") || null,
          avatar: u.imageUrl || null,
        },
      ])
    )
  )

  const collaborators = rows.map((r) => ({
    id: r.id,
    email: r.email,
    name: emailToClerk.get(r.email)?.name ?? null,
    avatar: emailToClerk.get(r.email)?.avatar ?? null,
    isOwner: false,
  }))

  // Fetch owner info and prepend to the list
  const ownerUser = await (await clerkClient()).users.getUser(project.ownerId)
  const ownerEmail = ownerUser.emailAddresses[0]?.emailAddress ?? ""
  const ownerName = [ownerUser.firstName, ownerUser.lastName].filter(Boolean).join(" ") || null
  const ownerEntry = {
    id: `owner-${project.ownerId}`,
    email: ownerEmail,
    name: ownerName,
    avatar: ownerUser.imageUrl || null,
    isOwner: true,
  }

  return Response.json({ isOwner, collaborators: [ownerEntry, ...collaborators] })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  })
  if (!project) return Response.json({ error: "Not found" }, { status: 404 })
  if (project.ownerId !== userId) return Response.json({ error: "Forbidden" }, { status: 403 })

  const body = await request.json()
  const email = (body?.email as string | undefined)?.trim().toLowerCase()
  if (!email) return Response.json({ error: "Email is required" }, { status: 400 })

  // Don't let owner add themselves
  const ownerUser = await (await clerkClient()).users.getUser(userId)
  const ownerEmail = ownerUser.emailAddresses[0]?.emailAddress?.toLowerCase()
  if (ownerEmail === email) {
    return Response.json({ error: "Owner cannot be added as collaborator" }, { status: 400 })
  }

  const existing = await prisma.projectCollaborator.findUnique({
    where: { projectId_email: { projectId, email } },
    select: { id: true },
  })
  if (existing) return Response.json({ error: "Already a collaborator" }, { status: 409 })

  const collab = await prisma.projectCollaborator.create({
    data: { projectId, email },
    select: { id: true, email: true },
  })

  // Enrich with Clerk if user exists
  const result = await (await clerkClient()).users.getUserList({ emailAddress: [email] })
  const clerkUser = result.data[0]
  const name = clerkUser
    ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null
    : null
  const avatar = clerkUser?.imageUrl ?? null

  return Response.json({ id: collab.id, email: collab.email, name, avatar }, { status: 201 })
}
