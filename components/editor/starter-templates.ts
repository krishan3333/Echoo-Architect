import type { CanvasNode, CanvasEdge } from "@/types/canvas"

export interface CanvasTemplate {
  id: string
  name: string
  description: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

const BLUE   = { color: "#10233D", textColor: "#52A8FF" }
const PURPLE = { color: "#2E1938", textColor: "#BF7AF0" }
const ORANGE = { color: "#331B00", textColor: "#FF990A" }
const GREEN  = { color: "#0F2E18", textColor: "#62C073" }
const TEAL   = { color: "#062822", textColor: "#0AC7B4" }

function n(
  id: string,
  label: string,
  x: number, y: number,
  w: number, h: number,
  shape: CanvasNode["data"]["shape"],
  palette: { color: string; textColor: string },
): CanvasNode {
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    data: { label, shape, color: palette.color, textColor: palette.textColor },
    width: w,
    height: h,
  }
}

function e(id: string, source: string, target: string, label?: string): CanvasEdge {
  return { id, type: "canvasEdge", source, target, data: label ? { label } : {} }
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices",
    description: "API gateway routing requests to independent services backed by a shared database.",
    nodes: [
      n("ms-gw",   "API Gateway",     270,  40, 180,  60, "pill",      ORANGE),
      n("ms-auth", "Auth Service",      60, 180, 160,  72, "rectangle", BLUE),
      n("ms-ord",  "Order Service",    270, 180, 160,  72, "rectangle", BLUE),
      n("ms-prod", "Product Service",  480, 180, 160,  72, "rectangle", BLUE),
      n("ms-db",   "Database",         270, 340, 100, 110, "cylinder",  TEAL),
    ],
    edges: [
      e("me-1", "ms-gw",   "ms-auth"),
      e("me-2", "ms-gw",   "ms-ord"),
      e("me-3", "ms-gw",   "ms-prod"),
      e("me-4", "ms-auth", "ms-db"),
      e("me-5", "ms-ord",  "ms-db"),
      e("me-6", "ms-prod", "ms-db"),
    ],
  },
  {
    id: "cicd-pipeline",
    name: "CI/CD Pipeline",
    description: "Source code flowing through build, test, and deployment stages into production.",
    nodes: [
      n("ci-src",    "Source Control",  40, 120, 150, 60, "rectangle", BLUE),
      n("ci-build",  "Build",          250, 120, 130, 60, "rectangle", ORANGE),
      n("ci-test",   "Test",           440, 120, 130, 60, "rectangle", TEAL),
      n("ci-deploy", "Deploy",         630, 120, 130, 60, "rectangle", PURPLE),
      n("ci-prod",   "Production",     820, 120, 150, 60, "rectangle", GREEN),
    ],
    edges: [
      e("ce-1", "ci-src",    "ci-build"),
      e("ce-2", "ci-build",  "ci-test"),
      e("ce-3", "ci-test",   "ci-deploy"),
      e("ce-4", "ci-deploy", "ci-prod"),
    ],
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description: "Producers publish events to a central bus consumed by independent subscribers.",
    nodes: [
      n("ev-pa",  "Producer A",  40,  90, 150, 65, "rectangle", BLUE),
      n("ev-pb",  "Producer B",  40, 220, 150, 65, "rectangle", BLUE),
      n("ev-bus", "Event Bus",  290, 140, 160, 90, "hexagon",   PURPLE),
      n("ev-ca",  "Consumer A", 560,  40, 150, 65, "rectangle", TEAL),
      n("ev-cb",  "Consumer B", 560, 165, 150, 65, "rectangle", TEAL),
      n("ev-cc",  "Consumer C", 560, 285, 150, 65, "rectangle", TEAL),
    ],
    edges: [
      e("ee-1", "ev-pa",  "ev-bus"),
      e("ee-2", "ev-pb",  "ev-bus"),
      e("ee-3", "ev-bus", "ev-ca"),
      e("ee-4", "ev-bus", "ev-cb"),
      e("ee-5", "ev-bus", "ev-cc"),
    ],
  },
]
