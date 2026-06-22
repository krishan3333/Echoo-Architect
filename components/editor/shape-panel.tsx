"use client"

import type { DragEvent } from "react"
import type { ShapeType } from "@/types/canvas"

interface ShapeConfig {
  shape: ShapeType
  label: string
  width: number
  height: number
  icon: string
}

const SHAPES: ShapeConfig[] = [
  { shape: "rectangle", label: "Rectangle", width: 160, height: 80, icon: "▭" },
  { shape: "diamond",   label: "Diamond",   width: 130, height: 130, icon: "◇" },
  { shape: "circle",    label: "Circle",    width: 80,  height: 80,  icon: "○" },
  { shape: "pill",      label: "Pill",      width: 160, height: 60,  icon: "⬭" },
  { shape: "cylinder",  label: "Cylinder",  width: 80,  height: 100, icon: "⬜" },
  { shape: "hexagon",   label: "Hexagon",   width: 100, height: 100, icon: "⬡" },
]

export const DRAG_TYPE = "application/ghost-shape"

export function ShapePanel() {
  function handleDragStart(e: DragEvent<HTMLButtonElement>, cfg: ShapeConfig) {
    e.dataTransfer.setData(
      DRAG_TYPE,
      JSON.stringify({ shape: cfg.shape, width: cfg.width, height: cfg.height })
    )
    e.dataTransfer.effectAllowed = "copy"
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-5 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-[#0d0f14]/90 px-3 py-2 shadow-lg backdrop-blur-md">
        {SHAPES.map((cfg) => (
          <button
            key={cfg.shape}
            draggable
            onDragStart={(e) => handleDragStart(e, cfg)}
            title={cfg.label}
            className="flex h-8 w-8 cursor-grab items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white/90 active:cursor-grabbing"
          >
            <span className="select-none text-base leading-none">{cfg.icon}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
