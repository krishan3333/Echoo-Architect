"use client"

import React, { useCallback, useContext, useEffect, useRef, useState, type DragEvent } from "react"
import {
  ReactFlow,
  Background,
  MiniMap,
  BackgroundVariant,
  Handle,
  NodeResizer,
  Position,
  useReactFlow,
  useViewport,
  useNodes,
  useEdges,
  getSmoothStepPath,
  EdgeLabelRenderer,
  type NodeProps,
  type EdgeProps,
  type OnNodesChange,
  type OnEdgesChange,
  type ReactFlowInstance,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import { useUndo, useRedo, useCanUndo, useCanRedo, useOthers, useUpdateMyPresence } from "@liveblocks/react"
import { PresenceAvatars } from "@/components/editor/presence-avatars"
import { ZoomIn, ZoomOut, Maximize2, Undo2, Redo2 } from "lucide-react"
import { NODE_COLORS } from "@/types/canvas"
import type { CanvasNode, CanvasEdge, NodeColorPair, ShapeType } from "@/types/canvas"
import { ShapePanel, DRAG_TYPE } from "@/components/editor/shape-panel"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { useCanvasAutosave } from "@/hooks/use-canvas-autosave"
import type { SaveStatus } from "@/hooks/use-canvas-autosave"
import type { CanvasTemplate } from "@/components/editor/starter-templates"

const FILL = "rgba(255,255,255,0.05)"
const BORDER_REST = "rgba(255,255,255,0.2)"
const BORDER_SELECTED = "rgba(255,255,255,0.65)"

const MIN_W = 80
const MIN_H = 50

const HANDLE_STYLE: React.CSSProperties = {
  width: 8,
  height: 8,
  background: "#1a1d24",
  border: "1.5px solid rgba(255,255,255,0.4)",
  borderRadius: "50%",
}

const RESIZE_HANDLE_STYLE: React.CSSProperties = {
  width: 8,
  height: 8,
  background: "#1a1d24",
  border: "1.5px solid rgba(255,255,255,0.4)",
  borderRadius: 2,
}

const RESIZE_LINE_STYLE: React.CSSProperties = {
  borderColor: "rgba(255,255,255,0.12)",
}

const CanvasCtx = React.createContext<{
  onNodesChange: OnNodesChange<CanvasNode>
  onEdgesChange: OnEdgesChange<CanvasEdge>
} | null>(null)

function nodeBorder(selected: boolean) {
  return selected ? BORDER_SELECTED : BORDER_REST
}

function NodeHandles({ visible }: { visible: boolean }) {
  const style: React.CSSProperties = {
    ...HANDLE_STYLE,
    opacity: visible ? 1 : 0,
    pointerEvents: "all",
    transition: "opacity 0.15s",
  }
  return (
    <>
      <Handle type="source" position={Position.Top} id="t-s" style={style} />
      <Handle type="target" position={Position.Top} id="t-t" style={style} />
      <Handle type="source" position={Position.Right} id="r-s" style={style} />
      <Handle type="target" position={Position.Right} id="r-t" style={style} />
      <Handle type="source" position={Position.Bottom} id="b-s" style={style} />
      <Handle type="target" position={Position.Bottom} id="b-t" style={style} />
      <Handle type="source" position={Position.Left} id="l-s" style={style} />
      <Handle type="target" position={Position.Left} id="l-t" style={style} />
    </>
  )
}

function ColorToolbar({ nodeId, activeBg }: { nodeId: string; activeBg: string }) {
  const ctx = useContext(CanvasCtx)
  const { getNode } = useReactFlow<CanvasNode, CanvasEdge>()

  function applyColor(pair: NodeColorPair) {
    const node = getNode(nodeId)
    if (node && ctx) {
      ctx.onNodesChange([{
        type: "replace",
        id: nodeId,
        item: { ...node, data: { ...node.data, color: pair.bg, textColor: pair.text } },
      }])
    }
  }

  return (
    <div
      className="nodrag nopan"
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        bottom: "calc(100% + 8px)",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 5,
        alignItems: "center",
        background: "#18181c",
        border: "1px solid #2a2a30",
        borderRadius: 999,
        padding: "5px 8px",
        zIndex: 100,
        pointerEvents: "all",
        whiteSpace: "nowrap",
      }}
    >
      {NODE_COLORS.map((pair) => {
        const isActive = activeBg === pair.bg
        return (
          <button
            key={pair.bg}
            className="nodrag nopan"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); applyColor(pair) }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 5px 1px ${pair.text}55`
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = ""
            }}
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: pair.bg,
              border: isActive ? `2.5px solid ${pair.text}` : "2px solid rgba(255,255,255,0.15)",
              cursor: "pointer",
              outline: "none",
              padding: 0,
              flexShrink: 0,
              transition: "box-shadow 0.12s, border-color 0.12s",
            }}
          />
        )
      })}
    </div>
  )
}

function NodeSvg({ shape, selected, fillColor }: { shape: ShapeType; selected: boolean; fillColor: string }) {
  const stroke = nodeBorder(selected)
  const sw = 1.5

  if (shape === "diamond") {
    return (
      <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="50,2 98,50 50,98 2,50" fill={fillColor} stroke={stroke} strokeWidth={sw} />
      </svg>
    )
  }

  if (shape === "hexagon") {
    return (
      <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="50,2 95,26 95,74 50,98 5,74 5,26" fill={fillColor} stroke={stroke} strokeWidth={sw} />
      </svg>
    )
  }

  if (shape === "cylinder") {
    return (
      <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 80 100" preserveAspectRatio="none">
        <path d="M 4,12 L 4,88 A 36,10 0 0,1 76,88 L 76,12 Z" fill={fillColor} stroke="none" />
        <line x1="4" y1="12" x2="4" y2="88" stroke={stroke} strokeWidth={sw} />
        <line x1="76" y1="12" x2="76" y2="88" stroke={stroke} strokeWidth={sw} />
        <path d="M 4,88 A 36,10 0 0,1 76,88" fill="none" stroke={stroke} strokeWidth={sw} />
        <ellipse cx="40" cy="12" rx="36" ry="10" fill={fillColor} stroke={stroke} strokeWidth={sw} />
      </svg>
    )
  }

  return null
}

function NodeLabel({ nodeId, data }: { nodeId: string; data: CanvasNode["data"] }) {
  const ctx = useContext(CanvasCtx)
  const { getNode } = useReactFlow<CanvasNode, CanvasEdge>()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(data.label ?? "")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!editing) setDraft(data.label ?? "")
  }, [data.label, editing])

  useEffect(() => {
    if (editing) {
      textareaRef.current?.focus()
      textareaRef.current?.select()
    }
  }, [editing])

  function commit() {
    const node = getNode(nodeId)
    if (node && ctx) {
      ctx.onNodesChange([{ type: "replace", id: nodeId, item: { ...node, data: { ...node.data, label: draft } } }])
    }
    setEditing(false)
  }

  function cancel() {
    setDraft(data.label ?? "")
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") { e.stopPropagation(); cancel() }
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commit() }
  }

  const textColor = data.textColor ?? "rgba(255,255,255,0.85)"

  if (editing) {
    return (
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className="nodrag nopan"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "calc(100% - 16px)",
          background: "transparent",
          border: "none",
          outline: "none",
          color: textColor,
          fontSize: 13,
          lineHeight: 1.4,
          textAlign: "center",
          resize: "none",
          overflow: "hidden",
          zIndex: 10,
        }}
        rows={2}
      />
    )
  }

  return (
    <div
      className="absolute inset-0 flex items-center justify-center select-none"
      style={{ zIndex: 1 }}
      onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }}
    >
      <span
        style={{
          color: data.label ? textColor : "rgba(255,255,255,0.25)",
          fontSize: 13,
          lineHeight: 1.4,
          textAlign: "center",
          padding: "0 8px",
          wordBreak: "break-word",
          pointerEvents: "none",
        }}
      >
        {data.label || "Label"}
      </span>
    </div>
  )
}

function CanvasNodeComponent({ id, data, selected }: NodeProps<CanvasNode>) {
  const shape = data.shape ?? "rectangle"
  const isSelected = selected ?? false
  const fillColor = data.color ?? FILL
  const [hovered, setHovered] = useState(false)
  const handlesVisible = isSelected || hovered

  if (shape === "rectangle" || shape === "pill" || shape === "circle") {
    const radius = shape === "pill" ? 9999 : shape === "circle" ? "50%" : 6
    return (
      <div
        className="relative h-full w-full"
        style={{ border: `1.5px solid ${nodeBorder(isSelected)}`, background: fillColor, borderRadius: radius }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {isSelected && <ColorToolbar nodeId={id} activeBg={fillColor} />}
        <NodeResizer
          isVisible={isSelected}
          minWidth={MIN_W}
          minHeight={MIN_H}
          handleStyle={RESIZE_HANDLE_STYLE}
          lineStyle={RESIZE_LINE_STYLE}
        />
        <NodeHandles visible={handlesVisible} />
        <NodeLabel nodeId={id} data={data} />
      </div>
    )
  }

  return (
    <div
      className="relative h-full w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isSelected && <ColorToolbar nodeId={id} activeBg={fillColor} />}
      <NodeResizer
        isVisible={isSelected}
        minWidth={MIN_W}
        minHeight={MIN_H}
        handleStyle={RESIZE_HANDLE_STYLE}
        lineStyle={RESIZE_LINE_STYLE}
      />
      <NodeSvg shape={shape} selected={isSelected} fillColor={fillColor} />
      <NodeHandles visible={handlesVisible} />
      <NodeLabel nodeId={id} data={data} />
    </div>
  )
}

function CanvasEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
}: EdgeProps<CanvasEdge>) {
  const ctx = useContext(CanvasCtx)
  const { getEdge } = useReactFlow<CanvasNode, CanvasEdge>()
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(data?.label ?? "")
  const inputRef = useRef<HTMLInputElement>(null)

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 6,
  })

  useEffect(() => {
    if (!editing) setDraft(data?.label ?? "")
  }, [data?.label, editing])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function commit() {
    const edge = getEdge(id)
    if (edge && ctx) {
      ctx.onEdgesChange([{
        type: "replace",
        id,
        item: { ...edge, data: { ...edge.data, label: draft } },
      }])
    }
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "Escape") {
      e.preventDefault()
      e.stopPropagation()
      commit()
    }
  }

  const isActive = selected || hovered
  const strokeColor = isActive ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)"
  const markerId = `arrow-${id}`
  const label = data?.label

  return (
    <>
      <defs>
        <marker
          id={markerId}
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="5"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M 0 1 L 9 5 L 0 9 Z" fill={strokeColor} style={{ transition: "fill 0.15s" }} />
        </marker>
      </defs>
      {/* invisible wide hit area */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }}
        style={{ cursor: "pointer" }}
      />
      {/* visible path */}
      <path
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        markerEnd={`url(#${markerId})`}
        style={{ transition: "stroke 0.15s", pointerEvents: "none" }}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
        >
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={handleKeyDown}
              className="nodrag nopan"
              style={{
                background: "#18181c",
                border: "1px solid #2a2a30",
                borderRadius: 999,
                padding: "2px 8px",
                fontSize: 11,
                color: "rgba(255,255,255,0.85)",
                outline: "none",
                minWidth: 40,
                width: `${Math.max(40, (draft.length || 1) * 7 + 16)}px`,
                textAlign: "center",
              }}
            />
          ) : label ? (
            <div
              onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }}
              style={{
                background: "#18181c",
                border: "1px solid #2a2a30",
                borderRadius: 999,
                padding: "2px 8px",
                fontSize: 11,
                color: "rgba(255,255,255,0.8)",
                cursor: "text",
                whiteSpace: "nowrap",
                userSelect: "none",
              }}
            >
              {label}
            </div>
          ) : isActive ? (
            <div
              onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }}
              style={{
                padding: "2px 8px",
                fontSize: 11,
                color: "rgba(255,255,255,0.25)",
                cursor: "text",
                userSelect: "none",
              }}
            >
              Add label
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

const NODE_TYPES = { canvasNode: CanvasNodeComponent }
const EDGE_TYPES = { canvasEdge: CanvasEdgeComponent }

const BTN = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  borderRadius: "50%",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: "rgba(255,255,255,0.6)",
  transition: "background 0.12s, color 0.12s, opacity 0.12s",
  outline: "none",
  flexShrink: 0,
} as React.CSSProperties

function LiveCursors() {
  const others = useOthers()
  const { x: vpX, y: vpY, zoom } = useViewport()

  return (
    <>
      {others.map((other) => {
        if (!other.presence.cursor) return null
        const { x: cx, y: cy } = other.presence.cursor
        const screenX = vpX + cx * zoom
        const screenY = vpY + cy * zoom
        const color = other.info?.cursorColor ?? "#6366f1"
        const name = other.info?.name ?? "Collaborator"

        return (
          <div
            key={other.connectionId}
            style={{
              position: "absolute",
              left: screenX,
              top: screenY,
              pointerEvents: "none",
              zIndex: 50,
              userSelect: "none",
            }}
          >
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
              <path
                d="M0 0L0 13.5L3.5 9.5L6.5 16.5L8.5 15.5L5.5 8.5L11.5 8.5Z"
                fill={color}
                stroke="rgba(0,0,0,0.25)"
                strokeWidth="0.75"
              />
            </svg>
            <div
              style={{
                position: "absolute",
                top: 14,
                left: 10,
                background: color,
                color: "#fff",
                borderRadius: 4,
                padding: "2px 6px",
                fontSize: 11,
                fontWeight: 500,
                whiteSpace: "nowrap",
                boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
              }}
            >
              {name}
            </div>
          </div>
        )
      })}
    </>
  )
}

function ControlBar({
  rfRef,
  undo,
  redo,
  canUndo,
  canRedo,
}: {
  rfRef: React.RefObject<ReactFlowInstance<CanvasNode, CanvasEdge> | null>
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}) {
  function hoverOn(e: React.MouseEvent<HTMLButtonElement>) {
    const btn = e.currentTarget
    if (!btn.disabled) {
      btn.style.background = "rgba(255,255,255,0.08)"
      btn.style.color = "rgba(255,255,255,0.9)"
    }
  }
  function hoverOff(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.style.background = "transparent"
    e.currentTarget.style.color = "rgba(255,255,255,0.6)"
  }

  function disabledStyle(disabled: boolean): React.CSSProperties {
    return disabled ? { opacity: 0.3, cursor: "default", pointerEvents: "none" } : {}
  }

  return (
    <div
      className="nodrag nopan"
      style={{
        position: "absolute",
        left: 16,
        bottom: 76,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        gap: 2,
        background: "rgba(13,15,20,0.9)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 999,
        padding: "4px 8px",
        backdropFilter: "blur(8px)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
      }}
    >
      {/* zoom group */}
      <button
        title="Zoom out (-)"
        style={{ ...BTN }}
        onMouseEnter={hoverOn}
        onMouseLeave={hoverOff}
        onClick={() => rfRef.current?.zoomOut({ duration: 200 })}
      >
        <ZoomOut size={14} />
      </button>
      <button
        title="Fit view"
        style={{ ...BTN }}
        onMouseEnter={hoverOn}
        onMouseLeave={hoverOff}
        onClick={() => rfRef.current?.fitView({ duration: 300 })}
      >
        <Maximize2 size={13} />
      </button>
      <button
        title="Zoom in (+)"
        style={{ ...BTN }}
        onMouseEnter={hoverOn}
        onMouseLeave={hoverOff}
        onClick={() => rfRef.current?.zoomIn({ duration: 200 })}
      >
        <ZoomIn size={14} />
      </button>

      {/* divider */}
      <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.12)", margin: "0 4px", flexShrink: 0 }} />

      {/* history group */}
      <button
        title="Undo (Ctrl+Z)"
        disabled={!canUndo}
        style={{ ...BTN, ...disabledStyle(!canUndo) }}
        onMouseEnter={hoverOn}
        onMouseLeave={hoverOff}
        onClick={undo}
      >
        <Undo2 size={14} />
      </button>
      <button
        title="Redo (Ctrl+Shift+Z)"
        disabled={!canRedo}
        style={{ ...BTN, ...disabledStyle(!canRedo) }}
        onMouseEnter={hoverOn}
        onMouseLeave={hoverOff}
        onClick={redo}
      >
        <Redo2 size={14} />
      </button>
    </div>
  )
}

interface CanvasProps {
  projectId: string
  pendingTemplate?: CanvasTemplate | null
  onTemplateImported?: () => void
  onSaveStatusChange?: (status: SaveStatus) => void
  onSaveReady?: (save: () => void) => void
}

function DeleteHandler({
  onNodesChange,
  onEdgesChange,
}: {
  onNodesChange: OnNodesChange<CanvasNode>
  onEdgesChange: OnEdgesChange<CanvasEdge>
}) {
  const nodes = useNodes<CanvasNode>()
  const edges = useEdges<CanvasEdge>()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Delete" && e.key !== "Backspace") return
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) return

      const selectedNodes = nodes.filter((n) => n.selected)
      const selectedEdges = edges.filter((ed) => ed.selected)
      if (selectedNodes.length === 0 && selectedEdges.length === 0) return

      if (selectedNodes.length > 0) {
        onNodesChange(selectedNodes.map((n) => ({ type: "remove" as const, id: n.id })))
      }
      if (selectedEdges.length > 0) {
        onEdgesChange(selectedEdges.map((ed) => ({ type: "remove" as const, id: ed.id })))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [nodes, edges, onNodesChange, onEdgesChange])

  return null
}

export function Canvas({ projectId, pendingTemplate, onTemplateImported, onSaveStatusChange, onSaveReady }: CanvasProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true })

  const undo = useUndo()
  const redo = useRedo()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()
  const updateMyPresence = useUpdateMyPresence()

  const rfInstance = useRef<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null)
  const counterRef = useRef(0)
  const [ready, setReady] = useState(false)

  // Refs so the effect closure always sees latest values without re-triggering
  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)
  const onNodesChangeRef = useRef(onNodesChange)
  const onEdgesChangeRef = useRef(onEdgesChange)
  const onTemplateImportedRef = useRef(onTemplateImported)
  nodesRef.current = nodes
  edgesRef.current = edges
  onNodesChangeRef.current = onNodesChange
  onEdgesChangeRef.current = onEdgesChange
  onTemplateImportedRef.current = onTemplateImported

  // On mount: load saved canvas from blob if the Liveblocks room is empty
  useEffect(() => {
    async function load() {
      if (nodesRef.current.length > 0 || edgesRef.current.length > 0) {
        setReady(true)
        return
      }
      try {
        const res = await fetch(`/api/projects/${projectId}/canvas`)
        if (res.ok) {
          const saved = await res.json() as { nodes: CanvasNode[]; edges: CanvasEdge[] }
          if (saved.nodes.length > 0 || saved.edges.length > 0) {
            onNodesChangeRef.current(saved.nodes.map(n => ({ type: "add" as const, item: n })))
            onEdgesChangeRef.current(saved.edges.map(e => ({ type: "add" as const, item: e })))
            setTimeout(() => rfInstance.current?.fitView({ duration: 300 }), 50)
          }
        }
      } catch {}
      setReady(true)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { saveStatus, save } = useCanvasAutosave({ projectId, nodes, edges, ready })

  const onSaveStatusChangeRef = useRef(onSaveStatusChange)
  onSaveStatusChangeRef.current = onSaveStatusChange
  useEffect(() => {
    onSaveStatusChangeRef.current?.(saveStatus)
  }, [saveStatus])

  const onSaveReadyRef = useRef(onSaveReady)
  onSaveReadyRef.current = onSaveReady
  useEffect(() => {
    onSaveReadyRef.current?.(save)
  }, [save])

  useEffect(() => {
    if (!pendingTemplate) return
    onNodesChangeRef.current([
      ...nodesRef.current.map(n => ({ type: "remove" as const, id: n.id })),
      ...pendingTemplate.nodes.map(n => ({ type: "add" as const, item: n })),
    ])
    onEdgesChangeRef.current([
      ...edgesRef.current.map(e => ({ type: "remove" as const, id: e.id })),
      ...pendingTemplate.edges.map(e => ({ type: "add" as const, item: e })),
    ])
    setTimeout(() => rfInstance.current?.fitView({ duration: 400 }), 50)
    onTemplateImportedRef.current?.()
  }, [pendingTemplate])

  useKeyboardShortcuts(rfInstance, undo, redo)

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!rfInstance.current) return
      const pos = rfInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      updateMyPresence({ cursor: pos })
    },
    [updateMyPresence]
  )

  const handleMouseLeave = useCallback(() => {
    updateMyPresence({ cursor: null })
  }, [updateMyPresence])

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
    <CanvasCtx.Provider value={{ onNodesChange, onEdgesChange }}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDelete={onDelete}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          defaultEdgeOptions={{ type: "canvasEdge" }}
          onInit={(instance) => { rfInstance.current = instance }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
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
          <ControlBar rfRef={rfInstance} undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} />
          <ShapePanel />
          <LiveCursors />
          <DeleteHandler onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} />
        </ReactFlow>
        <PresenceAvatars />
      </div>
    </CanvasCtx.Provider>
  )
}
