import type { Node, Edge } from "@xyflow/react"

export type ShapeType = "rectangle" | "diamond" | "circle" | "pill" | "cylinder" | "hexagon"

export interface NodeColorPair {
  bg: string
  text: string
}

export const NODE_COLORS: NodeColorPair[] = [
  { bg: "#1F1F1F", text: "#EDEDED" },
  { bg: "#10233D", text: "#52A8FF" },
  { bg: "#2E1938", text: "#BF7AF0" },
  { bg: "#331B00", text: "#FF990A" },
  { bg: "#3C1618", text: "#FF6166" },
  { bg: "#3A1726", text: "#F75F8F" },
  { bg: "#0F2E18", text: "#62C073" },
  { bg: "#062822", text: "#0AC7B4" },
]

export interface NodeData extends Record<string, unknown> {
  label: string
  color?: string
  textColor?: string
  shape?: ShapeType
}

export interface EdgeData extends Record<string, unknown> {
  label?: string
}

export type CanvasNode = Node<NodeData, "canvasNode">
export type CanvasEdge = Edge<EdgeData, "canvasEdge">
