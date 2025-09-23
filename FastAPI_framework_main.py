#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FastAPI Framework - AI Boot Camp Lab Main Controller
논문 검색 → PDF 다운로드 → 퀴즈 생성 및 TTS 팟캐스트 제작을 자동화하는 REST API
"""

import os
import sys
import subprocess
import time
import asyncio
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

# FastAPI 및 관련 라이브러리
from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# 실제 모델들 임포트 (main.py에서 사용하는 것과 동일)
from axpress_scholar_agent_ver1 import AXPressScholarAgent, Paper
from quiz_tts_agent import PDFQuizSystem

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic 모델들
class DomainRequest(BaseModel):
    domain: str = Field(..., description="검색할 도메인 (제조, 금융, CLOUD, 통신, 유통/물류, Gen AI)")
    additional_keywords: Optional[str] = Field(None, description="추가 검색 키워드")
    year_range: int = Field(1, ge=1, le=2, description="검색 기간 (1-2년)")

class PaperResponse(BaseModel):
    id: str
    title: str
    authors: List[str]
    published_date: str
    updated_date: str
    abstract: str
    categories: List[str]
    pdf_url: str
    arxiv_url: str
    citation_count: int = 0
    relevance_score: float = 0.0

class DownloadRequest(BaseModel):
    paper_index: int = Field(..., ge=0, description="다운로드할 논문 인덱스")

class QuizRequest(BaseModel):
    pdf_path: str = Field(..., description="분석할 PDF 파일 경로")

class WorkflowRequest(BaseModel):
    domain: str = Field(..., description="검색할 도메인")
    additional_keywords: Optional[str] = Field(None, description="추가 검색 키워드")
    year_range: int = Field(1, ge=1, le=2, description="검색 기간")
    paper_index: int = Field(0, ge=0, description="다운로드할 논문 인덱스")

class WorkflowResponse(BaseModel):
    success: bool
    message: str
    workflow_id: str
    papers: List[PaperResponse]
    downloaded_pdf: Optional[str] = None
    quiz_generated: bool = False
    podcast_created: bool = False

class StatusResponse(BaseModel):
    workflow_id: str
    status: str
    progress: int
    current_step: str
    message: str
    results: Optional[Dict[str, Any]] = None

# 실제 모델들 초기화
scholar_agent = AXPressScholarAgent()
quiz_system = PDFQuizSystem()
downloaded_papers_dir = Path("downloaded_papers")
workflow_status = {}  # 워크플로우 상태 추적

# 지원 도메인
SUPPORTED_DOMAINS = ["제조", "금융", "CLOUD", "통신", "유통/물류", "Gen AI"]

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 생명주기 관리"""
    # 시작 시 실행
    downloaded_papers_dir.mkdir(exist_ok=True)
    logger.info("FastAPI 앱이 시작되었습니다.")
    
    yield
    
    # 종료 시 실행
    logger.info("FastAPI 앱이 종료되었습니다.")

# FastAPI 앱에 lifespan 추가
app = FastAPI(
    title="AI Boot Camp Lab - Main Controller API",
    description="논문 검색부터 퀴즈 생성 및 TTS 팟캐스트 제작까지 자동화하는 REST API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS 미들웨어 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "AI Boot Camp Lab - Main Controller API",
        "version": "1.0.0",
        "docs": "/docs",
        "supported_domains": SUPPORTED_DOMAINS
    }

@app.get("/domains")
async def get_supported_domains():
    """지원되는 도메인 목록 반환"""
    return {
        "domains": SUPPORTED_DOMAINS,
        "count": len(SUPPORTED_DOMAINS)
    }

@app.post("/search/papers", response_model=List[PaperResponse])
async def search_papers(request: DomainRequest):
    """도메인별 논문 검색"""
    try:
        if request.domain not in SUPPORTED_DOMAINS:
            raise HTTPException(
                status_code=400, 
                detail=f"지원하지 않는 도메인입니다. 지원 도메인: {SUPPORTED_DOMAINS}"
            )
        
        logger.info(f"논문 검색 시작: 도메인={request.domain}, 키워드={request.additional_keywords}")
        
        # 논문 검색 (실제 모델 사용)
        papers = scholar_agent.fetch_papers(request.domain)
        
        if not papers:
            raise HTTPException(status_code=404, detail="검색된 논문이 없습니다.")
        
        # Paper 객체를 PaperResponse로 변환
        paper_responses = []
        for paper in papers:
            paper_responses.append(PaperResponse(
                id=paper.id,
                title=paper.title,
                authors=paper.authors,
                published_date=paper.published_date,
                updated_date=paper.updated_date,
                abstract=paper.abstract,
                categories=paper.categories,
                pdf_url=paper.pdf_url,
                arxiv_url=paper.arxiv_url,
                citation_count=paper.citation_count,
                relevance_score=paper.relevance_score
            ))
        
        logger.info(f"논문 검색 완료: {len(paper_responses)}편 발견")
        return paper_responses
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"논문 검색 오류: {e}")
        raise HTTPException(status_code=500, detail=f"논문 검색 중 오류가 발생했습니다: {str(e)}")

@app.post("/download/pdf")
async def download_pdf(request: DownloadRequest, papers_data: List[PaperResponse]):
    """논문 PDF 다운로드"""
    try:
        if request.paper_index >= len(papers_data):
            raise HTTPException(
                status_code=400, 
                detail=f"잘못된 논문 인덱스입니다. 0-{len(papers_data)-1} 범위에서 선택해주세요."
            )
        
        selected_paper_data = papers_data[request.paper_index]
        
        # Paper 객체 생성 (실제 모델 구조에 맞게)
        paper = Paper(
            id=selected_paper_data.id,
            title=selected_paper_data.title,
            authors=selected_paper_data.authors,
            published_date=selected_paper_data.published_date,
            updated_date=selected_paper_data.updated_date,
            abstract=selected_paper_data.abstract,
            categories=selected_paper_data.categories,
            pdf_url=selected_paper_data.pdf_url,
            arxiv_url=selected_paper_data.arxiv_url,
            citation_count=selected_paper_data.citation_count,
            relevance_score=selected_paper_data.relevance_score
        )
        
        logger.info(f"PDF 다운로드 시작: {paper.title}")
        
        # PDF 다운로드 (실제 모델 사용)
        filepath = scholar_agent.download_pdf(paper)
        
        if not filepath:
            raise HTTPException(status_code=500, detail="PDF 다운로드에 실패했습니다.")
        
        logger.info(f"PDF 다운로드 완료: {filepath}")
        
        return {
            "success": True,
            "message": "PDF 다운로드가 완료되었습니다.",
            "filepath": filepath,
            "filename": os.path.basename(filepath)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF 다운로드 오류: {e}")
        raise HTTPException(status_code=500, detail=f"PDF 다운로드 중 오류가 발생했습니다: {str(e)}")

@app.get("/papers/downloaded")
async def get_downloaded_papers():
    """다운로드된 PDF 파일 목록 반환"""
    try:
        if not downloaded_papers_dir.exists():
            return {"papers": [], "count": 0}
        
        pdf_files = list(downloaded_papers_dir.glob("*.pdf"))
        papers_info = []
        
        for pdf_file in pdf_files:
            stat = pdf_file.stat()
            papers_info.append({
                "filename": pdf_file.name,
                "filepath": str(pdf_file),
                "size": stat.st_size,
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
            })
        
        # 수정 시간 기준으로 정렬 (최신순)
        papers_info.sort(key=lambda x: x["modified"], reverse=True)
        
        return {
            "papers": papers_info,
            "count": len(papers_info)
        }
        
    except Exception as e:
        logger.error(f"다운로드된 논문 목록 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=f"논문 목록 조회 중 오류가 발생했습니다: {str(e)}")

@app.post("/quiz/generate")
async def generate_quiz(request: QuizRequest):
    """PDF 분석 및 퀴즈 생성 (실제 모델 사용)"""
    try:
        if not os.path.exists(request.pdf_path):
            raise HTTPException(status_code=404, detail="지정된 PDF 파일을 찾을 수 없습니다.")
        
        logger.info(f"퀴즈 생성 시작: {request.pdf_path}")
        
        # 퀴즈 생성 (실제 PDFQuizSystem 모델 사용)
        success = quiz_system.process_pdf(request.pdf_path)
        
        if not success:
            raise HTTPException(status_code=500, detail="퀴즈 생성에 실패했습니다.")
        
        logger.info("퀴즈 생성 완료")
        
        return {
            "success": True,
            "message": "퀴즈 생성이 완료되었습니다.",
            "pdf_path": request.pdf_path
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"퀴즈 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=f"퀴즈 생성 중 오류가 발생했습니다: {str(e)}")

@app.post("/workflow/start", response_model=WorkflowResponse)
async def start_workflow(request: WorkflowRequest, background_tasks: BackgroundTasks):
    """전체 워크플로우 시작 (논문 검색 → PDF 다운로드 → 퀴즈 생성)"""
    try:
        workflow_id = f"workflow_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # 워크플로우 상태 초기화
        workflow_status[workflow_id] = {
            "status": "started",
            "progress": 0,
            "current_step": "논문 검색",
            "message": "워크플로우가 시작되었습니다.",
            "results": {}
        }
        
        # 백그라운드에서 워크플로우 실행
        background_tasks.add_task(
            execute_workflow, 
            workflow_id, 
            request.domain, 
            request.additional_keywords,
            request.year_range,
            request.paper_index
        )
        
        return WorkflowResponse(
            success=True,
            message="워크플로우가 시작되었습니다.",
            workflow_id=workflow_id,
            papers=[],
            downloaded_pdf=None,
            quiz_generated=False,
            podcast_created=False
        )
        
    except Exception as e:
        logger.error(f"워크플로우 시작 오류: {e}")
        raise HTTPException(status_code=500, detail=f"워크플로우 시작 중 오류가 발생했습니다: {str(e)}")

async def execute_workflow(workflow_id: str, domain: str, additional_keywords: Optional[str], 
                         year_range: int, paper_index: int):
    """백그라운드에서 워크플로우 실행 (실제 모델 사용)"""
    try:
        # 1단계: 논문 검색 (실제 모델 사용)
        workflow_status[workflow_id].update({
            "status": "running",
            "progress": 20,
            "current_step": "논문 검색",
            "message": f"'{domain}' 도메인에서 논문을 검색하고 있습니다..."
        })
        
        papers = scholar_agent.fetch_papers(domain)
        
        if not papers:
            workflow_status[workflow_id].update({
                "status": "failed",
                "progress": 0,
                "current_step": "논문 검색",
                "message": "검색된 논문이 없습니다."
            })
            return
        
        # 2단계: PDF 다운로드 (실제 모델 사용)
        workflow_status[workflow_id].update({
            "progress": 50,
            "current_step": "PDF 다운로드",
            "message": f"논문 '{papers[paper_index].title}' PDF를 다운로드하고 있습니다..."
        })
        
        filepath = scholar_agent.download_pdf(papers[paper_index])
        
        if not filepath:
            workflow_status[workflow_id].update({
                "status": "failed",
                "progress": 50,
                "current_step": "PDF 다운로드",
                "message": "PDF 다운로드에 실패했습니다."
            })
            return
        
        # 3단계: 퀴즈 생성 (실제 모델 사용)
        workflow_status[workflow_id].update({
            "progress": 80,
            "current_step": "퀴즈 생성",
            "message": "PDF를 분석하고 퀴즈를 생성하고 있습니다..."
        })
        
        quiz_success = quiz_system.process_pdf(filepath)
        
        # 완료
        workflow_status[workflow_id].update({
            "status": "completed",
            "progress": 100,
            "current_step": "완료",
            "message": "전체 워크플로우가 완료되었습니다.",
            "results": {
                "papers_found": len(papers),
                "downloaded_pdf": filepath,
                "quiz_generated": quiz_success,
                "podcast_created": quiz_success
            }
        })
        
        logger.info(f"워크플로우 {workflow_id} 완료")
        
    except Exception as e:
        workflow_status[workflow_id].update({
            "status": "failed",
            "current_step": "오류",
            "message": f"워크플로우 실행 중 오류가 발생했습니다: {str(e)}"
        })
        logger.error(f"워크플로우 {workflow_id} 실행 오류: {e}")

@app.get("/workflow/status/{workflow_id}", response_model=StatusResponse)
async def get_workflow_status(workflow_id: str):
    """워크플로우 상태 조회"""
    if workflow_id not in workflow_status:
        raise HTTPException(status_code=404, detail="워크플로우를 찾을 수 없습니다.")
    
    status_data = workflow_status[workflow_id]
    return StatusResponse(
        workflow_id=workflow_id,
        status=status_data["status"],
        progress=status_data["progress"],
        current_step=status_data["current_step"],
        message=status_data["message"],
        results=status_data.get("results")
    )

@app.get("/workflow/list")
async def list_workflows():
    """실행 중인 워크플로우 목록"""
    return {
        "workflows": list(workflow_status.keys()),
        "count": len(workflow_status)
    }

@app.post("/upload/pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """PDF 파일 업로드"""
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="PDF 파일만 업로드 가능합니다.")
        
        # 파일 저장
        file_path = downloaded_papers_dir / file.filename
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        logger.info(f"PDF 파일 업로드 완료: {file_path}")
        
        return {
            "success": True,
            "message": "PDF 파일이 업로드되었습니다.",
            "filepath": str(file_path),
            "filename": file.filename
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF 업로드 오류: {e}")
        raise HTTPException(status_code=500, detail=f"PDF 업로드 중 오류가 발생했습니다: {str(e)}")

@app.get("/download/{filename}")
async def download_file(filename: str):
    """파일 다운로드"""
    try:
        file_path = downloaded_papers_dir / filename
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다.")
        
        return FileResponse(
            path=str(file_path),
            filename=filename,
            media_type='application/pdf'
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"파일 다운로드 오류: {e}")
        raise HTTPException(status_code=500, detail=f"파일 다운로드 중 오류가 발생했습니다: {str(e)}")

@app.get("/quiz/list")
async def get_quiz_list():
    """생성된 퀴즈 목록 조회"""
    try:
        quiz_dir = Path("quiz_outputs")
        tts_dir = Path("tts_outputs")
        
        if not quiz_dir.exists():
            return {"quizzes": [], "count": 0}
        
        quiz_files = list(quiz_dir.glob("*.txt"))
        quizzes_info = []
        
        for quiz_file in quiz_files:
            stat = quiz_file.stat()
            
            # 해당하는 TTS 파일 찾기
            tts_file = tts_dir / f"quiz_{quiz_file.stem}.wav"
            has_tts = tts_file.exists()
            
            quizzes_info.append({
                "filename": quiz_file.name,
                "filepath": str(quiz_file),
                "size": stat.st_size,
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "has_tts": has_tts,
                "tts_filepath": str(tts_file) if has_tts else None
            })
        
        # 수정 시간 기준으로 정렬 (최신순)
        quizzes_info.sort(key=lambda x: x["modified"], reverse=True)
        
        return {
            "quizzes": quizzes_info,
            "count": len(quizzes_info)
        }
        
    except Exception as e:
        logger.error(f"퀴즈 목록 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=f"퀴즈 목록 조회 중 오류가 발생했습니다: {str(e)}")

@app.get("/tts/list")
async def get_tts_list():
    """생성된 TTS 오디오 파일 목록 조회"""
    try:
        tts_dir = Path("tts_outputs")
        
        if not tts_dir.exists():
            return {"tts_files": [], "count": 0}
        
        tts_files = list(tts_dir.glob("*.wav"))
        tts_info = []
        
        for tts_file in tts_files:
            stat = tts_file.stat()
            tts_info.append({
                "filename": tts_file.name,
                "filepath": str(tts_file),
                "size": stat.st_size,
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
            })
        
        # 수정 시간 기준으로 정렬 (최신순)
        tts_info.sort(key=lambda x: x["modified"], reverse=True)
        
        return {
            "tts_files": tts_info,
            "count": len(tts_info)
        }
        
    except Exception as e:
        logger.error(f"TTS 목록 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=f"TTS 목록 조회 중 오류가 발생했습니다: {str(e)}")

@app.get("/download/quiz/{filename}")
async def download_quiz(filename: str):
    """퀴즈 파일 다운로드"""
    try:
        quiz_file = Path("quiz_outputs") / filename
        
        if not quiz_file.exists():
            raise HTTPException(status_code=404, detail="퀴즈 파일을 찾을 수 없습니다.")
        
        return FileResponse(
            path=str(quiz_file),
            filename=filename,
            media_type='text/plain'
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"퀴즈 파일 다운로드 오류: {e}")
        raise HTTPException(status_code=500, detail=f"퀴즈 파일 다운로드 중 오류가 발생했습니다: {str(e)}")

@app.get("/download/tts/{filename}")
async def download_tts(filename: str):
    """TTS 오디오 파일 다운로드"""
    try:
        tts_file = Path("tts_outputs") / filename
        
        if not tts_file.exists():
            raise HTTPException(status_code=404, detail="TTS 파일을 찾을 수 없습니다.")
        
        return FileResponse(
            path=str(tts_file),
            filename=filename,
            media_type='audio/wav'
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"TTS 파일 다운로드 오류: {e}")
        raise HTTPException(status_code=500, detail=f"TTS 파일 다운로드 중 오류가 발생했습니다: {str(e)}")

@app.delete("/workflow/{workflow_id}")
async def delete_workflow(workflow_id: str):
    """워크플로우 삭제"""
    if workflow_id not in workflow_status:
        raise HTTPException(status_code=404, detail="워크플로우를 찾을 수 없습니다.")
    
    del workflow_status[workflow_id]
    
    return {
        "success": True,
        "message": f"워크플로우 {workflow_id}가 삭제되었습니다."
    }

@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# 에러 핸들러
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": "요청한 리소스를 찾을 수 없습니다."}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "내부 서버 오류가 발생했습니다."}
    )

if __name__ == "__main__":
    # 개발 서버 실행
    uvicorn.run(
        "FastAPI_framework_main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )