"use client"

import { useState } from "react"
import { Header } from "@/components/Header/Header"
import { usePaper } from "@/contexts/PaperContext"
import { mockPapersByDomain, type PaperDomain, type PaperWithDomain } from "@/services/axpress-data"
import { PaperCarousel } from "@/components/AXpress/PaperCarousel"
import { PaperListView } from "@/components/AXpress/PaperListView"
import { SelectedPaperBadge } from "@/components/AXpress/SelectedPaperBadge"
import { LayoutGrid, List } from "lucide-react"

const DOMAINS: PaperDomain[] = ["금융", "통신", "제조", "유통/물류", "AI", "클라우드"]

export default function AXpressPage() {
  const { selectedPaper, selectPaper } = usePaper()
  const [selectedDomain, setSelectedDomain] = useState<PaperDomain>("AI")
  const [viewMode, setViewMode] = useState<"carousel" | "list">("carousel")

  const handlePaperSelect = (paper: PaperWithDomain) => {
    selectPaper(paper)
  }

  const currentPapers = mockPapersByDomain[selectedDomain]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--ax-bg-soft)] to-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 pt-12 pb-4 md:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--ax-fg)] mb-4">
            AXpress 논문 탐색
          </h1>
          {selectedPaper ? (
            <SelectedPaperBadge />
          ) : (
            <p className="text-lg text-[var(--ax-fg)]/70 mb-4 animate-pulse">
              도메인별 최신 논문을 탐색하고 학습하세요
            </p>
          )}
        </div>

        {/* View Toggle Button */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setViewMode("carousel")}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                viewMode === "carousel"
                  ? "bg-[var(--ax-accent)] text-white"
                  : "text-[var(--ax-fg)] hover:bg-gray-50"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="text-sm font-medium">카드 뷰</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                viewMode === "list"
                  ? "bg-[var(--ax-accent)] text-white"
                  : "text-[var(--ax-fg)] hover:bg-gray-50"
              }`}
            >
              <List className="w-4 h-4" />
              <span className="text-sm font-medium">리스트 뷰</span>
            </button>
          </div>
        </div>

        {/* Domain Tabs */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {DOMAINS.map((domain) => (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedDomain === domain
                    ? "bg-[var(--ax-accent)] text-white shadow-md"
                    : "bg-white text-[var(--ax-fg)] hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="mb-12">
          {viewMode === "carousel" ? (
            <div className="max-w-5xl mx-auto">
              <PaperCarousel papers={currentPapers} onPaperSelect={handlePaperSelect} />
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <PaperListView papers={currentPapers} onPaperSelect={handlePaperSelect} />
            </div>
          )}
        </div>        
      </main>
    </div>
  )
}
