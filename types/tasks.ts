import { z } from "zod"

export const AiStatusFeedMessageSchema = z.object({
  text: z.string().optional(),
})

export type AiStatusFeedMessage = z.infer<typeof AiStatusFeedMessageSchema>

export const AiChatMessageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  sender: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  timestamp: z.string(),
})

export type AiChatMessage = z.infer<typeof AiChatMessageSchema>
