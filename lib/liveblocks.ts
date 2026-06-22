import { Liveblocks } from "@liveblocks/node"

const CURSOR_COLORS = [
  "#E57373",
  "#FFB74D",
  "#FFF176",
  "#81C784",
  "#4FC3F7",
  "#7986CB",
  "#CE93D8",
  "#F48FB1",
]

export function getUserCursorColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0
  }
  return CURSOR_COLORS[hash % CURSOR_COLORS.length]
}

declare const globalThis: {
  liveblocksGlobal: Liveblocks | undefined
} & typeof global

export function getLiveblocksClient(): Liveblocks {
  if (globalThis.liveblocksGlobal) return globalThis.liveblocksGlobal
  const client = new Liveblocks({ secret: process.env.LIVEBLOCKS_SECRET_KEY! })
  if (process.env.NODE_ENV !== "production") {
    globalThis.liveblocksGlobal = client
  }
  return client
}
