"use client"

import React, { useState, type DragEvent } from "react"
import { createPortal } from "react-dom"
import type { ShapeType } from "@/types/canvas"

interface ShapeConfig {
  shape: ShapeType
  label: string
  width: number
  height: number
  icon: React.ReactNode
}

const SHAPES: ShapeConfig[] = [
  { shape: "rectangle", label: "Rectangle", width: 160, height: 80, icon: "▭" },
  { shape: "diamond",   label: "Diamond",   width: 130, height: 130, icon: "◇" },
  { shape: "circle",    label: "Circle",    width: 80,  height: 80,  icon: "○" },
  { shape: "pill",      label: "Pill",      width: 160, height: 60,  icon: "⬭" },
  { shape: "cylinder",  label: "Cylinder",  width: 80,  height: 100, icon: (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <ellipse cx="6" cy="3" rx="5" ry="2" />
      <line x1="1" y1="3" x2="1" y2="11" />
      <line x1="11" y1="3" x2="11" y2="11" />
      <path d="M 1,11 A 5,2 0 0,0 11,11" />
    </svg>
  ) },
  { shape: "hexagon",   label: "Hexagon",   width: 100, height: 100, icon: "⬡" },
]

export const DRAG_TYPE = "application/ghost-shape"

const PF = "rgba(255,255,255,0.08)"
const PS = "rgba(255,255,255,0.5)"
const PSW = 1.5

interface DragPreview {
  cfg: ShapeConfig
  x: number
  y: number
}

function ShapePreview({ cfg, x, y }: DragPreview) {
  const { shape, width, height } = cfg
  const left = x - width / 2
  const top = y - height / 2

  if (shape === "rectangle") {
    return (
      <div
        className="pointer-events-none fixed z-9999"
        style={{ left, top, width, height, background: PF, border: `${PSW}px solid ${PS}`, borderRadius: 6 }}
      />
    )
  }
  if (shape === "pill") {
    return (
      <div
        className="pointer-events-none fixed z-9999"
        style={{ left, top, width, height, background: PF, border: `${PSW}px solid ${PS}`, borderRadius: 9999 }}
      />
    )
  }
  if (shape === "circle") {
    return (
      <div
        className="pointer-events-none fixed z-9999"
        style={{ left, top, width, height, background: PF, border: `${PSW}px solid ${PS}`, borderRadius: "50%" }}
      />
    )
  }
  if (shape === "diamond") {
    return (
      <svg
        className="pointer-events-none fixed z-9999"
        style={{ left, top }}
        width={width}
        height={height}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon points="50,2 98,50 50,98 2,50" fill={PF} stroke={PS} strokeWidth={PSW} />
      </svg>
    )
  }
  if (shape === "hexagon") {
    return (
      <svg
        className="pointer-events-none fixed z-9999"
        style={{ left, top }}
        width={width}
        height={height}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon points="50,2 95,26 95,74 50,98 5,74 5,26" fill={PF} stroke={PS} strokeWidth={PSW} />
      </svg>
    )
  }
  if (shape === "cylinder") {
    return (
      <svg
        className="pointer-events-none fixed z-9999"
        style={{ left, top }}
        width={width}
        height={height}
        viewBox="0 0 80 100"
        preserveAspectRatio="none"
      >
        <path d="M 4,12 L 4,88 A 36,10 0 0,1 76,88 L 76,12 Z" fill={PF} stroke="none" />
        <line x1="4" y1="12" x2="4" y2="88" stroke={PS} strokeWidth={PSW} />
        <line x1="76" y1="12" x2="76" y2="88" stroke={PS} strokeWidth={PSW} />
        <path d="M 4,88 A 36,10 0 0,1 76,88" fill="none" stroke={PS} strokeWidth={PSW} />
        <ellipse cx="40" cy="12" rx="36" ry="10" fill={PF} stroke={PS} strokeWidth={PSW} />
      </svg>
    )
  }
  return null
}

export function ShapePanel() {
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null)

  function handleDragStart(e: DragEvent<HTMLButtonElement>, cfg: ShapeConfig) {
    e.dataTransfer.setData(
      DRAG_TYPE,
      JSON.stringify({ shape: cfg.shape, width: cfg.width, height: cfg.height })
    )
    e.dataTransfer.effectAllowed = "copy"

    const ghost = document.createElement("div")
    ghost.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;"
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 0, 0)
    setTimeout(() => document.body.removeChild(ghost), 0)

    setDragPreview({ cfg, x: e.clientX, y: e.clientY })
  }

  function handleDrag(e: DragEvent<HTMLButtonElement>) {
    if (e.clientX === 0 && e.clientY === 0) return
    setDragPreview((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null))
  }

  function handleDragEnd() {
    setDragPreview(null)
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-5 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-[#0d0f14]/90 px-3 py-2 shadow-lg backdrop-blur-md">
        {SHAPES.map((cfg) => (
          <button
            key={cfg.shape}
            draggable
            onDragStart={(e) => handleDragStart(e, cfg)}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            title={cfg.label}
            className="flex h-8 w-8 cursor-grab items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white/90 active:cursor-grabbing"
          >
            <span className="select-none text-base leading-none">{cfg.icon}</span>
          </button>
        ))}
      </div>
      {dragPreview && typeof document !== "undefined" &&
        createPortal(<ShapePreview {...dragPreview} />, document.body)
      }
    </div>
  )
}
