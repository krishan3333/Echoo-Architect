import { auth, currentUser } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"

export interface CurrentIdentity {
  userId: string
  email: string | null
}

export interface ProjectAccess {
  id: string
  name: string
  isOwner: boolean
}

export async function getCurrentIdentity(): Promise<CurrentIdentity | null> {
  const { userId } = await auth()
  if (!userId) return null

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? null

  return { userId, email }
}

export async function getProjectWithAccess(
  roomId: string,
  identity: CurrentIdentity
): Promise<ProjectAccess | null> {
  const project = await prisma.project.findUnique({
    where: { id: roomId },
    select: { id: true, name: true, ownerId: true },
  })

  if (!project) return null

  if (project.ownerId === identity.userId) {
    return { id: project.id, name: project.name, isOwner: true }
  }

  if (identity.email) {
    const collab = await prisma.projectCollaborator.findUnique({
      where: { projectId_email: { projectId: project.id, email: identity.email } },
      select: { id: true },
    })
    if (collab) return { id: project.id, name: project.name, isOwner: false }
  }

  return null
}
