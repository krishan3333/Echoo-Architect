import type { Node, Edge } from "@xyflow/react"

export type ShapeType = "rectangle" | "diamond" | "circle" | "pill" | "cylinder" | "hexagon"

export interface NodeData extends Record<string, unknown> {
  label: string
  color?: string
  shape?: ShapeType
}

export type CanvasNode = Node<NodeData, "canvasNode">
export type CanvasEdge = Edge<Record<string, never>, "canvasEdge">
