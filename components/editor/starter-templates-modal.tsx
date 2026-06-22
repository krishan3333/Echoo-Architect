"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CANVAS_TEMPLATES, type CanvasTemplate } from "@/components/editor/starter-templates"

const VP_W = 280
const VP_H = 160
const PAD  = 14

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const { nodes, edges } = template

  const xs  = nodes.map(nd => nd.position.x)
  const ys  = nodes.map(nd => nd.position.y)
  const x2s = nodes.map(nd => nd.position.x + (nd.width  ?? 160))
  const y2s = nodes.map(nd => nd.position.y + (nd.height ?? 80))

  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const maxX = Math.max(...x2s)
  const maxY = Math.max(...y2s)

  const contentW = maxX - minX || 1
  const contentH = maxY - minY || 1

  const scaleX = (VP_W - 2 * PAD) / contentW
  const scaleY = (VP_H - 2 * PAD) / contentH
  const scale  = Math.min(scaleX, scaleY)

  const scaledW = contentW * scale
  const scaledH = contentH * scale
  const ox = PAD + (VP_W - 2 * PAD - scaledW) / 2
  const oy = PAD + (VP_H - 2 * PAD - scaledH) / 2

  const tx = (x: number) => ox + (x - minX) * scale
  const ty = (y: number) => oy + (y - minY) * scale

  const centers = new Map(
    nodes.map(nd => [
      nd.id,
      {
        x: tx(nd.position.x) + (nd.width  ?? 160) * scale / 2,
        y: ty(nd.position.y) + (nd.height ?? 80)  * scale / 2,
      },
    ])
  )

  return (
    <svg
      viewBox={`0 0 ${VP_W} ${VP_H}`}
      width="100%"
      style={{ display: "block", aspectRatio: `${VP_W}/${VP_H}` }}
      preserveAspectRatio="xMidYMid meet"
    >
      {edges.map(edge => {
        const src = centers.get(edge.source)
        const tgt = centers.get(edge.target)
        if (!src || !tgt) return null
        return (
          <line
            key={edge.id}
            x1={src.x} y1={src.y}
            x2={tgt.x} y2={tgt.y}
            stroke="rgba(255,255,255,0.22)"
            strokeWidth={1}
          />
        )
      })}
      {nodes.map(nd => {
        const x  = tx(nd.position.x)
        const y  = ty(nd.position.y)
        const w  = (nd.width  ?? 160) * scale
        const h  = (nd.height ?? 80)  * scale
        const cx = x + w / 2
        const cy = y + h / 2
        const fill   = nd.data.color    ?? "rgba(255,255,255,0.05)"
        const stroke = nd.data.textColor ?? "rgba(255,255,255,0.3)"
        const sw    = 0.8
        const shape  = nd.data.shape ?? "rectangle"

        if (shape === "circle") {
          return (
            <circle key={nd.id} cx={cx} cy={cy} r={Math.min(w, h) / 2}
              fill={fill} stroke={stroke} strokeWidth={sw} />
          )
        }
        if (shape === "pill") {
          return (
            <rect key={nd.id} x={x} y={y} width={w} height={h} rx={h / 2}
              fill={fill} stroke={stroke} strokeWidth={sw} />
          )
        }
        if (shape === "diamond") {
          return (
            <polygon
              key={nd.id}
              points={`${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`}
              fill={fill} stroke={stroke} strokeWidth={sw}
            />
          )
        }
        if (shape === "hexagon") {
          const pts = [[50, 2], [95, 26], [95, 74], [50, 98], [5, 74], [5, 26]]
            .map(([px, py]) => `${x + (px / 100) * w},${y + (py / 100) * h}`)
            .join(" ")
          return (
            <polygon key={nd.id} points={pts}
              fill={fill} stroke={stroke} strokeWidth={sw} />
          )
        }
        if (shape === "cylinder") {
          const ry = Math.max(h * 0.12, 2)
          return (
            <g key={nd.id}>
              <path
                d={`M ${x},${y + ry} L ${x},${y + h} A ${w / 2},${ry} 0 0,0 ${x + w},${y + h} L ${x + w},${y + ry} Z`}
                fill={fill} stroke="none"
              />
              <line x1={x}     y1={y + ry} x2={x}     y2={y + h} stroke={stroke} strokeWidth={sw} />
              <line x1={x + w} y1={y + ry} x2={x + w} y2={y + h} stroke={stroke} strokeWidth={sw} />
              <path d={`M ${x},${y + h} A ${w / 2},${ry} 0 0,0 ${x + w},${y + h}`}
                fill="none" stroke={stroke} strokeWidth={sw} />
              <ellipse cx={cx} cy={y + ry} rx={w / 2} ry={ry}
                fill={fill} stroke={stroke} strokeWidth={sw} />
            </g>
          )
        }
        return (
          <rect key={nd.id} x={x} y={y} width={w} height={h} rx={2}
            fill={fill} stroke={stroke} strokeWidth={sw} />
        )
      })}
    </svg>
  )
}

interface StarterTemplatesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (template: CanvasTemplate) => void
}

export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  function handleImport(template: CanvasTemplate) {
    onImport(template)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/10">
          <DialogTitle>Starter Templates</DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Start from a pre-built diagram. Importing replaces the current canvas.
          </p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh] p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CANVAS_TEMPLATES.map(template => (
              <div
                key={template.id}
                className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition-colors hover:border-white/20"
              >
                <div className="w-full bg-[#07090c]">
                  <TemplatePreview template={template} />
                </div>

                <div className="flex flex-col gap-3 p-4">
                  <div>
                    <p className="text-sm font-medium">{template.name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleImport(template)}
                  >
                    Import
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
