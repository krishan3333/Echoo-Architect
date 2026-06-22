"use client"

import { useCallback, useRef, type DragEvent } from "react"
import {
  ReactFlow,
  Background,
  MiniMap,
  BackgroundVariant,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import type { CanvasNode, CanvasEdge } from "@/types/canvas"
import { ShapePanel, DRAG_TYPE } from "@/components/editor/shape-panel"

function CanvasNodeComponent({ data }: NodeProps<CanvasNode>) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded border border-white/20 bg-white/5 text-sm text-white/80">
      <span className="select-none px-2 text-center">{data.label || data.shape}</span>
    </div>
  )
}

const NODE_TYPES = { canvasNode: CanvasNodeComponent }

export function Canvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true })

  // Use the instance from onInit so screenToFlowPosition reads the inner
  // ReactFlow store (which has the live pan/zoom viewport), not the outer
  // ReactFlowProvider store (which has no viewport state).
  const rfInstance = useRef<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null)
  const counterRef = useRef(0)

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      if (!rfInstance.current) return

      const raw = e.dataTransfer.getData(DRAG_TYPE)
      if (!raw) return

      const { shape, width, height } = JSON.parse(raw) as {
        shape: CanvasNode["data"]["shape"]
        width: number
        height: number
      }

      const pos = rfInstance.current.screenToFlowPosition({ x: e.clientX, y: e.clientY })
      const id = `${shape}-${Date.now()}-${++counterRef.current}`

      onNodesChange([
        {
          type: "add",
          item: {
            id,
            type: "canvasNode",
            position: { x: pos.x - width / 2, y: pos.y - height / 2 },
            data: { label: "", shape },
            width,
            height,
          } as CanvasNode,
        },
      ])
    },
    [onNodesChange]
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDelete={onDelete}
      nodeTypes={NODE_TYPES}
      edgeTypes={{}}
      onInit={(instance) => { rfInstance.current = instance }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      fitView
      connectOnClick={false}
      connectionRadius={40}
      className="h-full w-full"
      style={{ background: "#07090c" }}
    >
      <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255,255,255,0.15)" />
      <MiniMap
        nodeColor="rgba(255,255,255,0.15)"
        maskColor="rgba(0,0,0,0.6)"
        style={{ background: "#0a0c10" }}
      />
      <ShapePanel />
    </ReactFlow>
  )
}
