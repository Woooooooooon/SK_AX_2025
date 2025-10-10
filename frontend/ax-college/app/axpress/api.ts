import type { PaperDomain } from "@/services/axpress-data"

const BASE_URL = "http://127.0.0.1:8000"

// API 응답 구조에 맞춘 타입 정의
export interface ApiPaperResponse {
  title: string
  abstract: string
  id: number
  authors: string[]
  published_date: string
  updated_date: string
  categories: string[]
  pdf_url: string
  arxiv_url: string
  citation_count: number
  relevance_score: number
  created_at: string
  updated_at: string
}

export interface ResearchSearchResponse {
  data: ApiPaperResponse[]
}

// 화면에 표시할 Paper 타입
export interface PaperWithDomain {
  id: string
  domain: PaperDomain
  title: string
  authors: string[]
  abstract: string
  source: string
  publishedAt: string
  url: string
  pdf_url?: string
  arxiv_url?: string
}

// API 응답을 화면용 Paper 타입으로 변환
function transformApiResponseToPaper(
  apiPaper: ApiPaperResponse,
  domain: PaperDomain
): PaperWithDomain {
  return {
    id: String(apiPaper.id),
    domain,
    title: apiPaper.title,
    authors: apiPaper.authors,
    abstract: apiPaper.abstract,
    source: apiPaper.categories.join(", ") || "arXiv",
    publishedAt: apiPaper.published_date,
    url: apiPaper.arxiv_url || apiPaper.pdf_url,
    pdf_url: apiPaper.pdf_url,
    arxiv_url: apiPaper.arxiv_url,
  }
}

// 도메인별 논문 캐시
const paperCache: Partial<Record<PaperDomain, PaperWithDomain[]>> = {}

/**
 * 캐시된 논문을 동기적으로 가져옵니다 (즉시 반환)
 */
export function getCachedPapers(domain: PaperDomain): PaperWithDomain[] | null {
  return paperCache[domain] || null
}

/**
 * 특정 도메인의 논문을 검색합니다.
 * 이미 캐시된 도메인이면 캐시에서 반환하고, 아니면 API 호출 후 캐시에 저장합니다.
 */
export async function fetchPapersByDomain(domain: PaperDomain): Promise<PaperWithDomain[]> {
  // 캐시에 있으면 캐시된 데이터 반환
  if (paperCache[domain]) {
    console.log(`[Cache Hit] ${domain} 도메인 논문 캐시에서 로드`)
    return paperCache[domain]!
  }

  console.log(`[API Call] ${domain} 도메인 논문 API 요청 시작`)

  try {
    const response = await fetch(`${BASE_URL}/research_search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ domain }),
    })

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status} ${response.statusText}`)
    }

    const data: ResearchSearchResponse = await response.json()

    // API 응답을 화면용 타입으로 변환
    const papers = data.data.map((apiPaper) => transformApiResponseToPaper(apiPaper, domain))

    // 캐시에 저장
    paperCache[domain] = papers

    console.log(`[API Success] ${domain} 도메인 논문 ${papers.length}개 로드 완료 및 캐시 저장`)

    return papers
  } catch (error) {
    console.error(`[API Error] ${domain} 도메인 논문 로드 실패:`, error)
    throw error
  }
}

/**
 * 캐시를 초기화합니다 (필요시 사용)
 */
export function clearPaperCache() {
  Object.keys(paperCache).forEach((key) => {
    delete paperCache[key as PaperDomain]
  })
  console.log("[Cache Cleared] 논문 캐시 초기화 완료")
}

// 다운로드 경로 캐시
const downloadPathCache: Record<string, string> = {}

interface ResearchDownloadResponse {
  output_path: string
}

/**
 * PDF 다운로드 API 호출
 */
export async function downloadPaperPDF(
  pdf_url: string,
  arxiv_url: string,
  title: string
): Promise<void> {
  try {
    console.log(`[PDF Download] ${title} 다운로드 시작`)

    const response = await fetch(`${BASE_URL}/research_download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pdf_url,
        arxiv_url,
        title,
      }),
    })

    if (!response.ok) {
      throw new Error(`다운로드 오류: ${response.status} ${response.statusText}`)
    }

    const data: ResearchDownloadResponse = await response.json()

    // output_path를 캐시에 저장
    downloadPathCache[title] = data.output_path
    console.log(`[PDF Download] 저장 경로: ${data.output_path}`)
    console.log(`[PDF Download Cache]`, downloadPathCache)

    // TODO: 백엔드 API 수정 후 아래 코드로 변경 예정
    // Blob으로 받아서 다운로드 처리
    // const blob = await response.blob()
    // const url = window.URL.createObjectURL(blob)
    // const a = document.createElement("a")
    // a.href = url
    // a.download = `${title}.pdf`
    // document.body.appendChild(a)
    // a.click()
    // window.URL.revokeObjectURL(url)
    // document.body.removeChild(a)

    console.log(`[PDF Download] ${title} 다운로드 완료`)
  } catch (error) {
    console.error(`[PDF Download Error] ${title} 다운로드 실패:`, error)
    throw error
  }
}

/**
 * 캐시된 다운로드 경로 조회
 */
export function getDownloadPath(title: string): string | undefined {
  return downloadPathCache[title]
}

/**
 * 캐시된 경로에서 파일명만 추출
 */
function extractFilename(path: string): string {
  // Windows/Unix 경로 모두 처리
  const parts = path.split(/[/\\]/)
  return parts[parts.length - 1]
}

/**
 * 실제 파일 다운로드 (GET /research/files/{filename})
 */
export async function downloadPaperFile(title: string): Promise<void> {
  const outputPath = downloadPathCache[title]

  if (!outputPath) {
    throw new Error("다운로드 경로를 찾을 수 없습니다. 논문을 다시 선택해주세요.")
  }

  const filename = extractFilename(outputPath)

  try {
    console.log(`[File Download] ${filename} 다운로드 시작`)

    const response = await fetch(`${BASE_URL}/research/files/${encodeURIComponent(filename)}`, {
      method: "GET",
    })

    if (!response.ok) {
      throw new Error(`파일 다운로드 오류: ${response.status} ${response.statusText}`)
    }

    // Blob으로 받아서 다운로드 처리
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    console.log(`[File Download] ${filename} 다운로드 완료`)
  } catch (error) {
    console.error(`[File Download Error] ${filename} 다운로드 실패:`, error)
    throw error
  }
}

/**
 * Windows 경로를 Unix 경로로 변환 (백슬래시를 슬래시로)
 */
function convertPathToUnix(path: string): string {
  return path.replace(/\\/g, "/")
}

export interface SummaryResponse {
  title: string
  summary: string
  pdf_link: string
}

// 요약 캐시
const summaryCache: Record<string, SummaryResponse> = {}

/**
 * 캐시된 요약을 동기적으로 가져옵니다
 */
export function getCachedSummary(title: string): SummaryResponse | null {
  return summaryCache[title] || null
}

/**
 * AI 요약 가져오기 (POST /summary)
 * 캐시에 있으면 캐시 반환, 없으면 API 호출 후 캐시 저장
 */
export async function getSummary(title: string): Promise<SummaryResponse> {
  // 캐시에 있으면 캐시된 데이터 반환
  if (summaryCache[title]) {
    console.log(`[Summary Cache Hit] ${title} 요약 캐시에서 로드`)
    return summaryCache[title]
  }

  const outputPath = downloadPathCache[title]

  if (!outputPath) {
    throw new Error("논문 경로를 찾을 수 없습니다. 논문을 다시 선택해주세요.")
  }

  // Windows 경로를 Unix 경로로 변환
  const unixPath = convertPathToUnix(outputPath)

  try {
    console.log(`[Summary API] ${title} 요약 요청 시작`)
    console.log(`[Summary API] 경로: ${unixPath}`)

    const response = await fetch(`${BASE_URL}/summary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: unixPath,
      }),
    })

    if (!response.ok) {
      throw new Error(`요약 생성 오류: ${response.status} ${response.statusText}`)
    }

    const data: SummaryResponse = await response.json()

    // 캐시에 저장
    summaryCache[title] = data
    console.log(`[Summary API] ${title} 요약 생성 완료 및 캐시 저장`)

    return data
  } catch (error) {
    console.error(`[Summary API Error] ${title} 요약 생성 실패:`, error)
    throw error
  }
}

export interface QuizQuestion {
  question: string
  answer: "O" | "X"
  explanation: string
}

export interface QuizResponse {
  data: QuizQuestion[]
}

// 퀴즈 캐시
const quizCache: Record<string, QuizQuestion[]> = {}

/**
 * 캐시된 퀴즈를 동기적으로 가져옵니다
 */
export function getCachedQuiz(title: string): QuizQuestion[] | null {
  return quizCache[title] || null
}

/**
 * O/X 퀴즈 가져오기 (POST /quiz)
 * 캐시에 있으면 캐시 반환, 없으면 API 호출 후 캐시 저장
 */
export async function getQuiz(title: string): Promise<QuizQuestion[]> {
  // 캐시에 있으면 캐시된 데이터 반환
  if (quizCache[title]) {
    console.log(`[Quiz Cache Hit] ${title} 퀴즈 캐시에서 로드`)
    return quizCache[title]
  }

  const outputPath = downloadPathCache[title]

  if (!outputPath) {
    throw new Error("논문 경로를 찾을 수 없습니다. 논문을 다시 선택해주세요.")
  }

  // Windows 경로를 Unix 경로로 변환
  const unixPath = convertPathToUnix(outputPath)

  try {
    console.log(`[Quiz API] ${title} 퀴즈 요청 시작`)
    console.log(`[Quiz API] 경로: ${unixPath}`)

    const response = await fetch(`${BASE_URL}/quiz`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: unixPath,
      }),
    })

    if (!response.ok) {
      throw new Error(`퀴즈 생성 오류: ${response.status} ${response.statusText}`)
    }

    const data: QuizResponse = await response.json()

    // 캐시에 저장
    quizCache[title] = data.data
    console.log(`[Quiz API] ${title} 퀴즈 ${data.data.length}개 생성 완료 및 캐시 저장`)

    return data.data
  } catch (error) {
    console.error(`[Quiz API Error] ${title} 퀴즈 생성 실패:`, error)
    throw error
  }
}

export interface TTSResponse {
  message: string
  pdf_path: string
  summary: string
  explainer: string
  tts_id: string
  audio_file: string
  download_url: string
  stream_url: string
}

// TTS 캐시
const ttsCache: Record<string, TTSResponse> = {}

/**
 * 캐시된 TTS를 동기적으로 가져옵니다
 */
export function getCachedTTS(title: string): TTSResponse | null {
  return ttsCache[title] || null
}

/**
 * TTS 생성 API (POST /tts/from-pdf-path)
 * 캐시에 있으면 캐시 반환, 없으면 API 호출 후 캐시 저장
 */
export async function generateTTS(title: string): Promise<TTSResponse> {
  // 캐시에 있으면 캐시된 데이터 반환
  if (ttsCache[title]) {
    console.log(`[TTS Cache Hit] ${title} TTS 캐시에서 로드`)
    return ttsCache[title]
  }

  const outputPath = downloadPathCache[title]

  if (!outputPath) {
    throw new Error("논문 경로를 찾을 수 없습니다. 논문을 다시 선택해주세요.")
  }

  // Windows 경로를 Unix 경로로 변환
  const unixPath = convertPathToUnix(outputPath)

  try {
    console.log(`[TTS API] ${title} TTS 생성 요청 시작`)
    console.log(`[TTS API] 경로: ${unixPath}`)

    const response = await fetch(`${BASE_URL}/tts/from-pdf-path`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pdf_path: unixPath,
      }),
    })

    if (!response.ok) {
      throw new Error(`TTS 생성 오류: ${response.status} ${response.statusText}`)
    }

    const data: TTSResponse = await response.json()

    // 캐시에 저장
    ttsCache[title] = data
    console.log(`[TTS API] ${title} TTS 생성 완료 및 캐시 저장`)

    return data
  } catch (error) {
    console.error(`[TTS API Error] ${title} TTS 생성 실패:`, error)
    throw error
  }
}

/**
 * TTS 오디오 스트리밍 URL 가져오기
 */
export function getTTSStreamURL(audioFile: string): string {
  return `${BASE_URL}/tts/${encodeURIComponent(audioFile)}/stream`
}

/**
 * TTS 오디오 다운로드
 */
export async function downloadTTSAudio(audioFile: string, title: string): Promise<void> {
  try {
    console.log(`[TTS Download] ${audioFile} 다운로드 시작`)

    const response = await fetch(`${BASE_URL}/tts/${encodeURIComponent(audioFile)}/download`, {
      method: "GET",
    })

    if (!response.ok) {
      throw new Error(`오디오 다운로드 오류: ${response.status} ${response.statusText}`)
    }

    // Blob으로 받아서 다운로드 처리
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title}_explainer.mp3`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    console.log(`[TTS Download] ${audioFile} 다운로드 완료`)
  } catch (error) {
    console.error(`[TTS Download Error] ${audioFile} 다운로드 실패:`, error)
    throw error
  }
}
