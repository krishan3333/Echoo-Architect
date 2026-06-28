import { auth, currentUser } from "@clerk/nextjs/server"
import { unstable_cache } from "next/cache"
import prisma from "@/lib/prisma"

export interface ProjectView {
  id: string
  name: string
  isOwned: boolean
}

export function projectsCacheTag(userId: string) {
  return `projects-user-${userId}`
}

async function fetchProjects(userId: string, email: string | null): Promise<ProjectView[]> {
  const [ownedProjects, sharedCollabs] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
    }),
    email
      ? prisma.projectCollaborator.findMany({
          where: { email },
          include: { project: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ])

  const owned: ProjectView[] = ownedProjects.map((p) => ({ ...p, isOwned: true }))
  const shared: ProjectView[] = sharedCollabs.map((c) => ({
    id: c.project.id,
    name: c.project.name,
    isOwned: false,
  }))

  return [...owned, ...shared]
}

export async function getProjectsForUser(identity?: { userId: string; email: string | null }): Promise<ProjectView[]> {
  let userId: string
  let email: string | null

  if (identity) {
    userId = identity.userId
    email = identity.email
  } else {
    const authResult = await auth()
    if (!authResult.userId) return []
    userId = authResult.userId
    const user = await currentUser()
    email = user?.emailAddresses[0]?.emailAddress ?? null
  }

  return unstable_cache(
    () => fetchProjects(userId, email),
    [`projects-${userId}`],
    { revalidate: 60, tags: [projectsCacheTag(userId)] }
  )()
}
