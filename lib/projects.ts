import { auth, currentUser } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"

export interface ProjectView {
  id: string
  name: string
  isOwned: boolean
}

export async function getProjectsForUser(): Promise<ProjectView[]> {
  const { userId } = await auth()
  if (!userId) return []

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress

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
