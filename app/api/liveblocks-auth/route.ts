import { auth, currentUser } from "@clerk/nextjs/server"
import { type NextRequest } from "next/server"
import { getLiveblocksClient, getUserCursorColor } from "@/lib/liveblocks"
import { getCurrentIdentity, getProjectWithAccess } from "@/lib/project-access"

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const roomId = (body?.roomId ?? body?.room) as string | undefined
  if (!roomId) return Response.json({ error: "roomId is required" }, { status: 400 })

  const identity = await getCurrentIdentity()
  if (!identity) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const projectAccess = await getProjectWithAccess(roomId, identity)
  if (!projectAccess) return Response.json({ error: "Forbidden" }, { status: 403 })

  const clerkUser = await currentUser()
  const name =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
    clerkUser?.emailAddresses[0]?.emailAddress ||
    "Anonymous"
  const avatar = clerkUser?.imageUrl ?? ""
  const cursorColor = getUserCursorColor(userId)

  const liveblocks = getLiveblocksClient()

  // Ensure the room exists (create only if needed)
  try {
    await liveblocks.getRoom(roomId)
  } catch {
    await liveblocks.createRoom(roomId, { defaultAccesses: [] })
  }

  const session = liveblocks.prepareSession(userId, {
    userInfo: { name, avatar, cursorColor },
  })
  session.allow(roomId, session.FULL_ACCESS)

  const { status, body: sessionBody } = await session.authorize()
  return new Response(sessionBody, { status })
}
