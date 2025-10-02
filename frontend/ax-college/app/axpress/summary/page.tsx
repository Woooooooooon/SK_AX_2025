"use client"

import { useEffect } from "react"
import { Header } from "@/components/Header/Header"
import { SelectedPaperBadge } from "@/components/AXpress/SelectedPaperBadge"
import { PaperProtectedRoute } from "@/components/AXpress/PaperProtectedRoute"
import { NextPageButton } from "@/components/AXpress/NextPageButton"
import { MissionNav } from "@/components/AXpress/MissionNav"
import { usePaper } from "@/contexts/PaperContext"

export default function SummaryPage() {
  const { selectedPaper, markStepComplete } = usePaper()

  // 페이지 방문 시 자동 완료 처리
  useEffect(() => {
    markStepComplete("summary")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <PaperProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[var(--ax-bg-soft)] to-white">
        <Header />
        <MissionNav />
        <main className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:px-8">
          <SelectedPaperBadge />

          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[var(--ax-fg)] mb-2">논문 요약</h1>
              <p className="text-[var(--ax-fg)]/70">선택한 논문의 핵심 내용을 확인하세요</p>
            </div>

            {/* Summary Content */}
            <div className="ax-card p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[var(--ax-fg)] mb-4">Abstract</h2>
                <p className="text-[var(--ax-fg)]/80 leading-relaxed whitespace-pre-line">
                  {selectedPaper?.abstract}
                </p>
              </div>

              <div className="border-t border-[var(--ax-border)] pt-6">
                <h2 className="text-xl font-semibold text-[var(--ax-fg)] mb-4">논문 정보</h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-[var(--ax-fg)]/60 mb-1">저자</dt>
                    <dd className="text-[var(--ax-fg)]">{selectedPaper?.authors.join(", ")}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-[var(--ax-fg)]/60 mb-1">출처</dt>
                    <dd className="text-[var(--ax-fg)]">{selectedPaper?.source}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-[var(--ax-fg)]/60 mb-1">게시일</dt>
                    <dd className="text-[var(--ax-fg)]">{selectedPaper?.publishedAt}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-[var(--ax-fg)]/60 mb-1">원문 링크</dt>
                    <dd>
                      <a
                        href={selectedPaper?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--ax-accent)] hover:underline"
                      >
                        논문 보기 →
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* AI Summary Section - Placeholder for future implementation */}
              <div className="border-t border-[var(--ax-border)] pt-6">
                <h2 className="text-xl font-semibold text-[var(--ax-fg)] mb-4">AI 요약</h2>
                <div className="bg-[var(--ax-bg-soft)] rounded-lg p-6 text-center">
                  <p className="text-[var(--ax-fg)]/60">AI 요약 기능이 곧 제공됩니다.</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* 다음 페이지로 이동 버튼 */}
        <NextPageButton
          nextPath="/axpress/quiz"
          buttonText="퀴즈 풀러가기"
          tooltipText="퀴즈로 이해도를 확인해보세요!"
        />
      </div>
    </PaperProtectedRoute>
  )
}
