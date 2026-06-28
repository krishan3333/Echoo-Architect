import { task } from "@trigger.dev/sdk/v3"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"
import { getLiveblocksClient } from "../lib/liveblocks"
import { NODE_COLORS } from "../types/canvas"

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY!,
})

const NodeSchema = z.object({
  id: z.string().describe("Unique node ID, e.g. 'ai-node-1'"),
  label: z.string().describe("Display label for the node"),
  shape: z
    .enum(["rectangle", "diamond", "circle", "pill", "cylinder", "hexagon"])
    .describe("Node shape"),
  colorIndex: z
    .number()
    .int()
    .min(0)
    .max(7)
    .describe("Color index 0-7: 0=dark, 1=blue, 2=purple, 3=orange, 4=red, 5=pink, 6=green, 7=teal"),
  x: z.number().describe("X position on canvas"),
  y: z.number().describe("Y position on canvas"),
  width: z.number().min(80).max(400).describe("Node width in pixels"),
  height: z.number().min(50).max(200).describe("Node height in pixels"),
})

const EdgeSchema = z.object({
  id: z.string().describe("Unique edge ID, e.g. 'ai-edge-1'"),
  source: z.string().describe("Source node ID"),
  target: z.string().describe("Target node ID"),
  label: z.string().optional().describe("Optional edge label"),
})

const DesignSchema = z.object({
  summary: z.string().describe("One-sentence summary of the generated architecture"),
  nodes: z.array(NodeSchema).min(3).max(14),
  edges: z.array(EdgeSchema).min(1).max(20),
})

export const designAgent = task({
  id: "design-agent",
  retry: { maxAttempts: 2 },
  run: async (payload: { prompt: string; roomId: string; triggeredBy: string }) => {
    const { prompt, roomId, triggeredBy } = payload
    const liveblocks = getLiveblocksClient()

    type BroadcastEvent = {
      type: "ai:status" | "ai:thinking" | "ai:cursor" | "ai:canvas-op"
      message?: string
      status?: "start" | "processing" | "complete" | "error"
      thinking?: boolean
      position?: { x: number; y: number } | null
      triggeredBy?: string
      op?: { [key: string]: string | number | boolean | null }
    }

    async function broadcast(event: BroadcastEvent) {
      try {
        await liveblocks.broadcastEvent(roomId, event)
      } catch (err) {
        console.error("[design-agent] broadcast failed:", err)
      }
    }

    try {
      await broadcast({ type: "ai:thinking", thinking: true })
      await broadcast({ type: "ai:status", message: "Echoo Architect is analyzing your prompt…", status: "start" })

      const { object: design } = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: DesignSchema,
        system: `You are Echoo Architect, an expert system architect designing for a collaborative canvas.

Layout rules:
- Node IDs: use "ai-node-1", "ai-node-2", etc. (sequential, starting from 1)
- Edge IDs: use "ai-edge-1", "ai-edge-2", etc.
- Start positions: x=120, y=100. Space nodes ~200px horizontally, ~150px vertically.
- Typical 3-tier: row y=100 (clients/gateway), y=250 (services), y=400 (data/infra)
- For microservices: arrange in a grid; use x=120,320,520,720 per column

Shapes:
- rectangle: general services, servers, components
- pill: API gateways, load balancers, CDN, proxies
- cylinder: databases, storage, object stores
- circle: users, clients, external triggers, start/end
- diamond: message queues, event buses, topics
- hexagon: third-party services, external systems

Colors (colorIndex):
- 0: dark/neutral (background services, workers)
- 1: blue (REST APIs, web servers, frontend)
- 2: purple (AI/ML, analytics, recommendation)
- 3: orange (queues, message buses, async workers)
- 4: red (auth, security, identity)
- 5: pink (external services, third-party)
- 6: green (databases, storage, persistence)
- 7: teal (cache, CDN, monitoring, observability)

Sizes: API gateway 160×55, Services 140×65, Databases 130×80, Queues 120×60, External 110×55, User/client 100×50

Generate a complete, realistic architecture with 5-12 nodes and meaningful edges showing data flow.`,
        prompt: `Design a system architecture for: ${prompt}`,
      })

      const nodeCount = design.nodes.length
      const edgeCount = design.edges.length
      await broadcast({
        type: "ai:status",
        message: `Adding ${nodeCount} nodes and ${edgeCount} connections to canvas…`,
        status: "processing",
      })

      // Show AI cursor near center of where we'll place the design
      const avgX = design.nodes.reduce((s, n) => s + n.x, 0) / nodeCount
      const avgY = design.nodes.reduce((s, n) => s + n.y, 0) / nodeCount
      await broadcast({ type: "ai:cursor", position: { x: avgX, y: avgY } })

      // Emit add_node ops
      for (const node of design.nodes) {
        const colorPair = NODE_COLORS[node.colorIndex] ?? NODE_COLORS[0]
        const op: { [key: string]: string | number | boolean | null } = {
          type: "add_node",
          id: node.id,
          label: node.label,
          shape: node.shape,
          colorIndex: node.colorIndex,
          color: colorPair.bg,
          textColor: colorPair.text,
          x: node.x,
          y: node.y,
          width: node.width,
          height: node.height,
        }
        await broadcast({ type: "ai:canvas-op", triggeredBy, op })
      }

      // Emit add_edge ops
      for (const edge of design.edges) {
        const op: { [key: string]: string | number | boolean | null } = {
          type: "add_edge",
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label ?? "",
        }
        await broadcast({ type: "ai:canvas-op", triggeredBy, op })
      }

      await broadcast({ type: "ai:status", message: design.summary, status: "complete" })

      return { summary: design.summary, nodeCount, edgeCount }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error"
      await broadcast({ type: "ai:status", message: `Design failed: ${msg}`, status: "error" })
      throw error
    } finally {
      await broadcast({ type: "ai:thinking", thinking: false })
      await broadcast({ type: "ai:cursor", position: null })
    }
  },
})
