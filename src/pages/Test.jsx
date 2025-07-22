import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateQuestions, detectDeviceInfo } from '../lib/test-utils'
import { insertTestSession, insertTestAnswer, updateTestSession } from '../lib/supabase'

export default function Test() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answers, setAnswers] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [startTime, setStartTime] = useState(Date.now())
  const [loading, setLoading] = useState(true)
  const [imagesLoaded, setImagesLoaded] = useState({ left: false, right: false })

  useEffect(() => {
    let mounted = true
    
    const init = async () => {
      if (mounted) {
        await initializeTest()
      }
    }
    
    init()
    
    return () => {
      mounted = false
    }
  }, [])

  // 개발자 도구 감지 (프로덕션 환경에서만)
  useEffect(() => {
    if (import.meta.env.DEV) {
      // 개발 환경에서는 개발자 도구 허용
      return
    }

    // 모바일 디바이스 체크
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    // 데스크톱과 모바일에 다른 threshold 적용
    const threshold = isMobile ? 300 : 160
    
    // 개발자 도구 감지 함수
    const devToolsCheck = () => {
      // 모바일에서는 크기 기반 감지 스킵 (너무 많은 오탐지)
      if (isMobile) {
        return
      }
      
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        // 개발자 도구가 열려있을 때
        alert('테스트 진행 중에는 개발자 도구를 사용할 수 없습니다.')
        navigate('/')
      }
    }

    // 초기 체크 (약간의 딜레이 후 실행)
    setTimeout(devToolsCheck, 1000)

    // 지속적인 체크 (모바일이 아닌 경우만)
    const interval = !isMobile ? setInterval(devToolsCheck, 500) : null

    // Resize 이벤트 감지 (모바일에서는 스킵)
    if (!isMobile) {
      window.addEventListener('resize', devToolsCheck)
    }

    // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C 차단
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
        (e.metaKey && e.altKey && ['I', 'J', 'C'].includes(e.key))
      ) {
        e.preventDefault()
        alert('테스트 진행 중에는 개발자 도구를 사용할 수 없습니다.')
      }
    }

    // 우클릭 차단 (모바일에서는 롱터치 메뉴로 필요할 수 있음)
    const handleContextMenu = (e) => {
      if (!isMobile) {
        e.preventDefault()
        return false
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      if (interval) {
        clearInterval(interval)
      }
      if (!isMobile) {
        window.removeEventListener('resize', devToolsCheck)
      }
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [navigate])

  const initializeTest = async () => {
    try {
      const deviceInfo = detectDeviceInfo()
      const { data } = await insertTestSession(deviceInfo)
      
      const newSessionId = data?.id || `offline-${Date.now()}`
      setSessionId(newSessionId)
      
      const generatedQuestions = generateQuestions()
      setQuestions(generatedQuestions)
      setLoading(false)
      
      return newSessionId // 세션 ID 반환
    } catch (error) {
      console.error('Failed to initialize test:', error)
      const newSessionId = `offline-${Date.now()}`
      setSessionId(newSessionId)
      
      const generatedQuestions = generateQuestions()
      setQuestions(generatedQuestions)
      setLoading(false)
      
      return newSessionId // 세션 ID 반환
    }
  }

  const handleNext = async () => {
    if (!selectedAnswer || !sessionId) {
      console.error('Cannot proceed: selectedAnswer or sessionId is missing')
      return
    }

    const currentQuestion = questions[currentQuestionIndex]
    const responseTime = Date.now() - startTime

    const answer = {
      questionId: currentQuestion.id,
      category: currentQuestion.category,
      leftImage: currentQuestion.leftResolution,
      rightImage: currentQuestion.rightResolution,
      correctAnswer: currentQuestion.correctAnswer,
      userAnswer: selectedAnswer,
      responseTime: responseTime,
      isRetest: currentQuestion.isRetest,
      session_id: sessionId,
    }

    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)

    // localStorage에 항상 저장 (결과 페이지에서 사용)
    localStorage.setItem(`answers-${sessionId}`, JSON.stringify(newAnswers))
    console.log(`Saved ${newAnswers.length} answers to localStorage for session ${sessionId}`)
    
    // Supabase 모드일 때 추가로 Supabase에도 저장
    if (sessionId && !sessionId.startsWith('offline-')) {
      insertTestAnswer(answer).catch(console.error)
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setStartTime(Date.now())
      setImagesLoaded({ left: false, right: false })
    } else {
      // 테스트 완료
      console.log('Test completed, navigating to:', `/result/${sessionId}`)
      console.log('Current sessionId:', sessionId)
      console.log('Total answers:', newAnswers.length)
      
      // Supabase에 완료 상태 업데이트
      if (sessionId && !sessionId.startsWith('offline-')) {
        await updateTestSession(sessionId, {
          completed_at: new Date().toISOString(),
          total_questions: questions.length,
          correct_count: newAnswers.filter(a => a.userAnswer === a.correctAnswer).length
        }).catch(console.error)
      }
      
      // localStorage 확인
      const stored = localStorage.getItem(`answers-${sessionId}`)
      console.log('Stored answers before navigation:', stored ? JSON.parse(stored).length : 'none')
      
      // navigate 전에 약간의 딜레이
      setTimeout(() => {
        navigate(`/result/${sessionId}`)
      }, 100)
    }
  }

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setSelectedAnswer(answers[currentQuestionIndex - 1]?.userAnswer || null)
      setImagesLoaded({ left: false, right: false })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">테스트 준비 중...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleBack}
              disabled={currentQuestionIndex === 0}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex items-center gap-6">
              <span className="text-sm font-medium text-gray-900">
                {currentQuestionIndex + 1} <span className="text-gray-400">/ {questions.length}</span>
              </span>
              <span className="text-sm text-gray-600 hidden sm:block">
                {Math.round(progress)}% 완료
              </span>
            </div>
          </div>
          
          {/* 프로그레스 바 */}
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 안내 텍스트 */}
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            더 선명한 이미지를 선택하세요
          </h2>
          <p className="text-gray-600">
            두 이미지를 비교하여 화질이 더 좋은 쪽을 선택해주세요
          </p>
        </div>

        {/* 이미지 비교 영역 */}
        <div className="relative">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
            {/* 왼쪽 이미지 */}
            <div className="relative group">
              <div 
                className={`card overflow-hidden cursor-pointer image-select ${selectedAnswer === 'left' ? 'selected' : ''}`}
                onClick={() => setSelectedAnswer('left')}
              >
                {(!imagesLoaded.left || !imagesLoaded.right) && (
                  <div className="aspect-[4/3] bg-gray-100 animate-pulse flex items-center justify-center">
                    <div className="text-gray-400">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                )}
                <img
                  src={`/images/${currentQuestion.imageId}_${currentQuestion.leftResolution}.jpg`}
                  alt="Left image"
                  className={`w-full h-auto ${(!imagesLoaded.left || !imagesLoaded.right) ? 'hidden' : ''}`}
                  loading="eager"
                  decoding="sync"
                  onLoad={() => setImagesLoaded(prev => ({ ...prev, left: true }))}
                />
              </div>
            </div>

            {/* VS 표시 - 모바일 */}
            <div className="flex items-center justify-center py-2 lg:hidden">
              <div className="bg-white/80 rounded-full px-3 py-1 text-xs font-semibold text-gray-500">
                VS
              </div>
            </div>

            {/* 오른쪽 이미지 */}
            <div className="relative group">
              <div 
                className={`card overflow-hidden cursor-pointer image-select ${selectedAnswer === 'right' ? 'selected' : ''}`}
                onClick={() => setSelectedAnswer('right')}
              >
                {(!imagesLoaded.left || !imagesLoaded.right) && (
                  <div className="aspect-[4/3] bg-gray-100 animate-pulse flex items-center justify-center">
                    <div className="text-gray-400">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                )}
                <img
                  src={`/images/${currentQuestion.imageId}_${currentQuestion.rightResolution}.jpg`}
                  alt="Right image"
                  className={`w-full h-auto ${(!imagesLoaded.left || !imagesLoaded.right) ? 'hidden' : ''}`}
                  loading="eager"
                  decoding="sync"
                  onLoad={() => setImagesLoaded(prev => ({ ...prev, right: true }))}
                />
              </div>
            </div>
          </div>

          {/* 데스크톱 VS 표시 - 작게 */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        bg-white/90 rounded-full px-4 py-2 shadow-md border border-gray-200 
                        z-10 hidden lg:flex">
            <span className="font-semibold text-gray-500 text-sm">VS</span>
          </div>
        </div>

        {/* 다음 버튼 */}
        <div className="text-center mt-8">
          <button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="btn-primary px-8 py-4 text-base font-semibold disabled:opacity-50 
                     disabled:cursor-not-allowed"
          >
            {currentQuestionIndex === questions.length - 1 ? '결과 확인하기' : '다음 문제'}
          </button>
        </div>
      </main>
    </div>
  )
}