import { schemaTask, metadata, logger } from "@trigger.dev/sdk/v3"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"
import { z } from "zod"
import { put } from "@vercel/blob"
import prisma from "@/lib/prisma"

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY!,
})

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
})

const NodeSchema = z.object({
  id: z.string(),
  data: z
    .object({
      label: z.string().optional(),
      shape: z.string().optional(),
      color: z.string().optional(),
    })
    .passthrough()
    .optional(),
  position: z
    .object({ x: z.number(), y: z.number() })
    .optional(),
})

const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  data: z
    .object({ label: z.string().optional() })
    .passthrough()
    .optional(),
})

export const generateSpec = schemaTask({
  id: "generate-spec",
  retry: { maxAttempts: 3, minTimeoutInMs: 1000, factor: 2 },
  schema: z.object({
    projectId: z.string(),
    roomId: z.string(),
    chatHistory: z.array(ChatMessageSchema).default([]),
    nodes: z.array(NodeSchema).default([]),
    edges: z.array(EdgeSchema).default([]),
  }),
  run: async (payload) => {
    const { projectId, chatHistory, nodes, edges } = payload

    metadata.set("status", "starting").set("projectId", projectId)

    logger.info("Generating spec", {
      projectId,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      chatMessages: chatHistory.length,
    })

    const nodeDescriptions = nodes
      .map((n) => {
        const label = n.data?.label ?? n.id
        const shape = n.data?.shape ?? "rectangle"
        const pos = n.position ? `at (${Math.round(n.position.x)}, ${Math.round(n.position.y)})` : ""
        return `- ${label} [${shape}] ${pos}`.trim()
      })
      .join("\n")

    const edgeDescriptions = edges
      .map((e) => {
        const srcNode = nodes.find((n) => n.id === e.source)
        const tgtNode = nodes.find((n) => n.id === e.target)
        const src = srcNode?.data?.label ?? e.source
        const tgt = tgtNode?.data?.label ?? e.target
        const lbl = e.data?.label ? ` (${e.data.label})` : ""
        return `- ${src} → ${tgt}${lbl}`
      })
      .join("\n")

    const chatContext =
      chatHistory.length > 0
        ? chatHistory
            .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
            .join("\n")
        : "No chat history."

    metadata.set("status", "generating")

    const { text: spec } = await generateText({
      model: google("gemini-2.5-flash"),
      system: `You are Ghost AI, a technical architect. Generate a detailed Markdown technical specification document from the provided canvas diagram and conversation context.

The spec must include:
1. **Overview** — what the system does
2. **Architecture Summary** — high-level description of the design
3. **Components** — a section per major node: purpose, responsibilities, interfaces
4. **Data Flow** — how data moves through the system based on the edges
5. **Key Design Decisions** — notable patterns and trade-offs visible in the diagram
6. **Implementation Notes** — practical considerations for building this system

Write in clear, professional technical English. Use Markdown headings, bullet points, and code blocks where appropriate. Output only the spec document — no preamble or meta-commentary.`,
      prompt: `## Canvas Nodes
${nodeDescriptions || "No nodes on canvas."}

## Canvas Edges
${edgeDescriptions || "No edges on canvas."}

## Conversation Context
${chatContext}

Generate the technical specification for this system architecture.`,
    })

    metadata.set("status", "persisting")

    const blob = await put(`specs/${projectId}/spec.md`, spec, {
      access: "private",
      contentType: "text/markdown",
      addRandomSuffix: true,
    })

    const projectSpec = await prisma.projectSpec.create({
      data: { projectId, filePath: blob.url },
    })

    metadata.set("status", "complete").set("specId", projectSpec.id)

    logger.info("Spec persisted", { specId: projectSpec.id, length: spec.length })

    return { spec, specId: projectSpec.id }
  },
})
