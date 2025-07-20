import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { updateTestSession } from '../lib/supabase'
import { generateUserResults } from '../lib/analytics'
import { detectDeviceInfo } from '../lib/test-utils'
import { initKakao, shareKakao } from '../lib/kakao'

export default function Result() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initKakao() // Kakao SDK 초기화
    calculateResults()
  }, [id])

  const calculateResults = async () => {
    try {
      // 오프라인 모드에서 localStorage에서 답변 가져오기
      let answers
      if (id?.startsWith('offline-')) {
        const stored = localStorage.getItem(`answers-${id}`)
        if (!stored) {
          console.error('No answers found in localStorage for:', id)
          navigate('/')
          return
        }
        answers = JSON.parse(stored)
      } else {
        // Supabase 모드에서도 일단 localStorage에서 가져오기
        const stored = localStorage.getItem(`answers-${id}`)
        if (!stored) {
          console.error('No answers found for session:', id)
          navigate('/')
          return
        }
        answers = JSON.parse(stored)
      }

      // 분석 수행
      const deviceInfo = detectDeviceInfo()
      const userResults = generateUserResults(answers, deviceInfo)

      setResults(userResults)

      // Supabase에 전체 분석 데이터 저장
      if (!id?.startsWith('offline-')) {
        const { dbData } = userResults
        updateTestSession(id, {
          ...dbData,
          score: userResults.score,
          percentile: userResults.percentile
        }).catch(console.error)
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to calculate results:', error)
      navigate('/')
    }
  }

  const getGradeEmoji = (score) => {
    if (score >= 90) return '🏆'
    if (score >= 80) return '🥇'
    if (score >= 70) return '🥈'
    if (score >= 60) return '🥉'
    return '💪'
  }

  const getGradeText = (score) => {
    if (score >= 90) return '탁월한 눈썰미'
    if (score >= 80) return '뛰어난 눈썰미'
    if (score >= 70) return '좋은 눈썰미'
    if (score >= 60) return '평균적인 눈썰미'
    return '연습이 필요해요'
  }

  if (loading || !results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">결과 분석 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 메인 결과 카드 */}
        <div className="card p-8 sm:p-12 text-center space-y-8 animate-fade-in">
          {/* 점수 및 등급 */}
          <div className="space-y-4">
            <div className="text-6xl">{getGradeEmoji(results.score)}</div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
              {results.score}점
            </h1>
            <p className="text-xl text-gray-600">{getGradeText(results.score)}</p>
          </div>

          {/* 백분위 */}
          <div className="bg-blue-50 text-blue-900 px-6 py-4 rounded-xl inline-block">
            <p className="text-sm font-medium">상위</p>
            <p className="text-2xl font-bold">{100 - results.percentile}%</p>
          </div>

          {/* 기본 통계 */}
          <div className="grid grid-cols-2 gap-4 py-6">
            <div className="border-r border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {results.dbData.correct_count}/{results.dbData.total_questions}
              </div>
              <div className="text-sm text-gray-500">정답</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {(results.dbData.avg_response_time / 1000).toFixed(1)}초
              </div>
              <div className="text-sm text-gray-500">평균 응답 시간</div>
            </div>
          </div>
        </div>



        {/* 공유하기 버튼 */}
        <div className="mt-8 card p-6 bg-yellow-50 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            친구에게 추천하기
          </h3>
          <button
            onClick={() => shareKakao(results.score, results.percentile)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2C5.58172 2 2 4.92157 2 8.46154C2 10.7308 3.42857 12.7179 5.57143 13.9487C5.42857 14.5128 4.71429 16.8718 4.64286 17.1026C4.64286 17.1026 4.64286 17.2564 4.71429 17.3333C4.78571 17.4103 4.92857 17.3333 4.92857 17.3333C5.21429 17.2564 8.07143 15.4872 8.71429 15.1026C9.14286 15.1795 9.57143 15.2308 10 15.2308C14.4183 15.2308 18 12.3103 18 8.76923C18 5.22821 14.4183 2 10 2Z" fill="currentColor"/>
            </svg>
            카카오톡으로 공유하기
          </button>
          <p className="text-sm text-gray-600 mt-3">
            내 점수를 친구들과 비교해보세요!
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/')}
            className="btn-secondary flex-1"
          >
            홈으로 돌아가기
          </button>
          <button
            onClick={() => navigate('/test')}
            className="btn-primary flex-1"
          >
            다시 테스트하기
          </button>
        </div>

        {/* 디버그 정보 (개발용) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 text-xs text-gray-400">
            <details>
              <summary>Debug Info</summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto">
                {JSON.stringify(results.dbData.detection_rates, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}