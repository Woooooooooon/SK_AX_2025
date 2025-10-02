"use client"

import { useState, useRef, useEffect } from "react"
import { Header } from "@/components/Header/Header"
import { SelectedPaperBadge } from "@/components/AXpress/SelectedPaperBadge"
import { PaperProtectedRoute } from "@/components/AXpress/PaperProtectedRoute"
import { NextPageButton } from "@/components/AXpress/NextPageButton"
import { MissionNav } from "@/components/AXpress/MissionNav"
import { usePaper } from "@/contexts/PaperContext"
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react"

export default function TTSPage() {
  const { markStepComplete } = usePaper()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(300) // Mock duration: 5 minutes
  const audioRef = useRef<HTMLAudioElement>(null)

  // 오디오가 끝까지 재생되었는지 확인
  const isAudioCompleted = currentTime >= duration

  // 페이지 방문 시 자동 완료 처리
  useEffect(() => {
    markStepComplete("tts")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    // Actual audio playback will be implemented when backend is ready
  }

  const handleSkip = (seconds: number) => {
    setCurrentTime((prev) => Math.max(0, Math.min(prev + seconds, duration)))
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number.parseInt(e.target.value)
    setCurrentTime(newTime)
  }

  return (
    <PaperProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[var(--ax-bg-soft)] to-white">
        <Header />
        <MissionNav />
        <main className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:px-8">
          <SelectedPaperBadge />

          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[var(--ax-fg)] mb-2">논문 팟캐스트</h1>
              <p className="text-[var(--ax-fg)]/70">논문 내용을 음성으로 들어보세요</p>
            </div>

            {/* Audio Player */}
            <div className="ax-card p-8 md:p-12">
              <div className="space-y-8">
                {/* Podcast Cover */}
                <div className="flex justify-center">
                  <div className="w-64 h-64 bg-gradient-to-br from-[var(--ax-accent)] to-purple-600 rounded-2xl shadow-lg flex items-center justify-center">
                    <Volume2 className="w-24 h-24 text-white" />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleProgressChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--ax-accent)]"
                  />
                  <div className="flex justify-between text-sm text-[var(--ax-fg)]/60">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={() => handleSkip(-10)}
                    className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="10초 뒤로"
                  >
                    <SkipBack className="w-6 h-6 text-[var(--ax-fg)]" />
                  </button>

                  <button
                    onClick={handlePlayPause}
                    className="p-6 rounded-full bg-[var(--ax-accent)] hover:bg-[var(--ax-accent)]/90 transition-colors shadow-lg"
                    aria-label={isPlaying ? "일시정지" : "재생"}
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </button>

                  <button
                    onClick={() => handleSkip(10)}
                    className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="10초 앞으로"
                  >
                    <SkipForward className="w-6 h-6 text-[var(--ax-fg)]" />
                  </button>
                </div>

                {/* Playback Speed */}
                <div className="flex justify-center gap-2">
                  {[0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                    <button
                      key={speed}
                      className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors text-[var(--ax-fg)]"
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                {/* Coming Soon Notice */}
                <div className="text-center pt-6 border-t border-[var(--ax-border)]">
                  <p className="text-[var(--ax-fg)]/60">
                    실제 오디오 재생 기능은 백엔드 연동 후 제공됩니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Transcript Section */}
            <div className="ax-card p-6">
              <h2 className="text-xl font-semibold text-[var(--ax-fg)] mb-4">스크립트</h2>
              <div className="bg-[var(--ax-bg-soft)] rounded-lg p-6 max-h-96 overflow-y-auto">
                <p className="text-[var(--ax-fg)]/70 leading-relaxed">
                  스크립트 내용이 여기에 표시됩니다. 백엔드 연동 후 실제 논문 내용 기반 스크립트가 제공됩니다.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* 다음 페이지로 이동 버튼 - 오디오 재생 완료 시 표시 */}
        <NextPageButton
          nextPath="/axpress/history"
          buttonText="학습 기록 보러가기"
          tooltipText="학습 기록을 확인해보세요!"
          trigger="custom"
          show={isAudioCompleted}
        />
      </div>
    </PaperProtectedRoute>
  )
}
