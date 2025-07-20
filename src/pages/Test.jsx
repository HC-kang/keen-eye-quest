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
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            {/* 왼쪽 이미지 */}
            <div className="relative group">
              <div 
                className={`card overflow-hidden cursor-pointer image-select ${selectedAnswer === 'left' ? 'selected' : ''}`}
                onClick={() => setSelectedAnswer('left')}
              >
                <img
                  src={`/images/${currentQuestion.imageId}_${currentQuestion.leftResolution}.jpg`}
                  alt="Left image"
                  className="w-full h-auto"
                  loading="eager"
                  decoding="sync"
                />
              </div>
              <button
                onClick={() => setSelectedAnswer('left')}
                className={`absolute bottom-6 left-6 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  selectedAnswer === 'left'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white/90 text-gray-700 hover:bg-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full border-2 ${
                    selectedAnswer === 'left'
                      ? 'border-white bg-white'
                      : 'border-gray-400'
                  }`}>
                    {selectedAnswer === 'left' && (
                      <span className="block w-2 h-2 bg-gray-900 rounded-full m-auto"></span>
                    )}
                  </span>
                  이미지 A
                </span>
              </button>
            </div>

            {/* VS 표시 */}
            <div className="flex items-center justify-center py-4 lg:hidden">
              <div className="bg-white rounded-full px-6 py-2 shadow-lg border border-gray-200">
                <span className="font-bold text-gray-600">VS</span>
              </div>
            </div>

            {/* 오른쪽 이미지 */}
            <div className="relative group">
              <div 
                className={`card overflow-hidden cursor-pointer image-select ${selectedAnswer === 'right' ? 'selected' : ''}`}
                onClick={() => setSelectedAnswer('right')}
              >
                <img
                  src={`/images/${currentQuestion.imageId}_${currentQuestion.rightResolution}.jpg`}
                  alt="Right image"
                  className="w-full h-auto"
                  loading="eager"
                  decoding="sync"
                />
              </div>
              <button
                onClick={() => setSelectedAnswer('right')}
                className={`absolute bottom-6 right-6 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  selectedAnswer === 'right'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white/90 text-gray-700 hover:bg-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full border-2 ${
                    selectedAnswer === 'right'
                      ? 'border-white bg-white'
                      : 'border-gray-400'
                  }`}>
                    {selectedAnswer === 'right' && (
                      <span className="block w-2 h-2 bg-gray-900 rounded-full m-auto"></span>
                    )}
                  </span>
                  이미지 B
                </span>
              </button>
            </div>
          </div>

          {/* 데스크톱 VS 표시 */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        bg-white rounded-2xl px-6 py-3 shadow-xl border border-gray-200 
                        z-20 hidden lg:flex">
            <span className="font-bold text-gray-600 text-lg">VS</span>
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