"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/Header/Header"
import { SelectedPaperBadge } from "@/components/AXpress/SelectedPaperBadge"
import { PaperProtectedRoute } from "@/components/AXpress/PaperProtectedRoute"
import { NextPageButton } from "@/components/AXpress/NextPageButton"
import { MissionNav } from "@/components/AXpress/MissionNav"
import { usePaper } from "@/contexts/PaperContext"
import { CheckCircle2, Circle } from "lucide-react"

// Mock quiz data - will be replaced with actual data from backend
const MOCK_QUIZ = [
  {
    id: "1",
    question: "이 논문의 주요 연구 목적은 무엇인가요?",
    options: [
      "새로운 알고리즘 개발",
      "기존 방법론 개선",
      "실험적 검증",
      "이론적 분석",
    ],
    correctAnswer: 0,
  },
  {
    id: "2",
    question: "논문에서 제시한 핵심 기여는?",
    options: [
      "성능 향상",
      "비용 절감",
      "새로운 접근법",
      "실용적 적용",
    ],
    correctAnswer: 2,
  },
]

export default function QuizPage() {
  const { markStepComplete } = usePaper()
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState(false)

  // 페이지 방문 시 자동 완료 처리
  useEffect(() => {
    markStepComplete("quiz")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    if (!showResults) {
      setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerIndex }))
    }
  }

  const handleSubmit = () => {
    setShowResults(true)
  }

  const handleReset = () => {
    setSelectedAnswers({})
    setShowResults(false)
  }

  const correctCount = MOCK_QUIZ.filter(
    (q) => selectedAnswers[q.id] === q.correctAnswer
  ).length

  return (
    <PaperProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[var(--ax-bg-soft)] to-white">
        <Header />
        <MissionNav />
        <main className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:px-8">
          <SelectedPaperBadge />

          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[var(--ax-fg)] mb-2">논문 퀴즈</h1>
              <p className="text-[var(--ax-fg)]/70">논문 내용을 얼마나 이해했는지 확인해보세요</p>
            </div>

            {/* Quiz Questions */}
            <div className="space-y-6">
              {MOCK_QUIZ.map((quiz, idx) => (
                <div key={quiz.id} className="ax-card p-6">
                  <h3 className="font-semibold text-[var(--ax-fg)] mb-4">
                    Q{idx + 1}. {quiz.question}
                  </h3>
                  <div className="space-y-3">
                    {quiz.options.map((option, optionIdx) => {
                      const isSelected = selectedAnswers[quiz.id] === optionIdx
                      const isCorrect = quiz.correctAnswer === optionIdx
                      const showCorrectAnswer = showResults && isCorrect
                      const showWrongAnswer = showResults && isSelected && !isCorrect

                      return (
                        <button
                          key={optionIdx}
                          onClick={() => handleAnswerSelect(quiz.id, optionIdx)}
                          disabled={showResults}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            showCorrectAnswer
                              ? "border-green-500 bg-green-50"
                              : showWrongAnswer
                                ? "border-red-500 bg-red-50"
                                : isSelected
                                  ? "border-[var(--ax-accent)] bg-[var(--ax-accent)]/5"
                                  : "border-gray-200 hover:border-[var(--ax-accent)]/50"
                          } ${showResults ? "cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <div className="flex items-center gap-3">
                            {showResults ? (
                              showCorrectAnswer || showWrongAnswer ? (
                                <CheckCircle2
                                  className={`h-5 w-5 ${showCorrectAnswer ? "text-green-600" : "text-red-600"}`}
                                />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-400" />
                              )
                            ) : (
                              <Circle
                                className={`h-5 w-5 ${isSelected ? "text-[var(--ax-accent)]" : "text-gray-400"}`}
                              />
                            )}
                            <span
                              className={
                                showCorrectAnswer
                                  ? "text-green-700 font-medium"
                                  : showWrongAnswer
                                    ? "text-red-700"
                                    : "text-[var(--ax-fg)]"
                              }
                            >
                              {option}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              {!showResults ? (
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(selectedAnswers).length !== MOCK_QUIZ.length}
                  className="ax-button-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  제출하기
                </button>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-[var(--ax-fg)] mb-4">
                      결과: {correctCount} / {MOCK_QUIZ.length} 정답
                    </p>
                    <button onClick={handleReset} className="ax-button-primary px-8 py-3">
                      다시 풀기
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>

        {/* 다음 페이지로 이동 버튼 - 퀴즈 제출 완료 시 표시 */}
        <NextPageButton
          nextPath="/axpress/tts"
          buttonText="팟캐스트 들으러가기"
          tooltipText="팟캐스트로 다시 들어보세요!"
          trigger="custom"
          show={showResults}
        />
      </div>
    </PaperProtectedRoute>
  )
}
