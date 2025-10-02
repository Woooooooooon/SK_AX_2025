"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Paper } from "@/types/axpress"

type MissionStep = "summary" | "quiz" | "tts" | "history"

interface PaperContextType {
  selectedPaper: Paper | null
  selectedPaperId: string | null
  selectPaper: (paper: Paper) => void
  clearPaper: () => void
  completedSteps: Set<MissionStep>
  markStepComplete: (step: MissionStep) => void
  clearProgress: () => void
}

const PaperContext = createContext<PaperContextType | undefined>(undefined)

export function PaperProvider({ children }: { children: ReactNode }) {
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<MissionStep>>(new Set())

  const selectPaper = (paper: Paper) => {
    // Generate unique 10-20 digit ID
    const uniqueId = `${Date.now()}${Math.random().toString(36).substring(2, 15)}`
    const paperWithId = { ...paper, id: uniqueId }
    setSelectedPaper(paperWithId)
    // 새 논문 선택 시 진행 상황 초기화
    setCompletedSteps(new Set())
  }

  const clearPaper = () => {
    setSelectedPaper(null)
    setCompletedSteps(new Set())
  }

  const markStepComplete = (step: MissionStep) => {
    setCompletedSteps((prev) => new Set(prev).add(step))
  }

  const clearProgress = () => {
    setCompletedSteps(new Set())
  }

  return (
    <PaperContext.Provider
      value={{
        selectedPaper,
        selectedPaperId: selectedPaper?.id ?? null,
        selectPaper,
        clearPaper,
        completedSteps,
        markStepComplete,
        clearProgress,
      }}
    >
      {children}
    </PaperContext.Provider>
  )
}

export function usePaper() {
  const context = useContext(PaperContext)
  if (context === undefined) {
    throw new Error("usePaper must be used within a PaperProvider")
  }
  return context
}
