import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { updateTestSession } from '../lib/supabase'
import { generateUserResults } from '../lib/analytics'
import { detectDeviceInfo } from '../lib/test-utils'

export default function Result() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

        {/* 추천 해상도 */}
        <div className="mt-8 card p-6 space-y-4 animate-fade-in">
          <h2 className="text-xl font-bold text-gray-900">맞춤 해상도 추천</h2>
          <div className="bg-green-50 text-green-900 p-4 rounded-lg">
            <p className="font-semibold mb-2">
              당신의 {results.deviceType === 'mobile' ? '모바일' : 
                     results.deviceType === 'tablet' ? '태블릿' : '데스크톱'}에 최적화된 해상도
            </p>
            <p className="text-2xl font-bold">{results.recommendation}</p>
            <p className="text-sm text-green-700 mt-2">
              화질과 데이터 사용량의 최적 균형점입니다
            </p>
          </div>
        </div>

        {/* 카테고리별 점수 */}
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">카테고리별 성적</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(results.dbData.category_scores).map(([category, accuracy]) => {
              const percentage = Math.round(accuracy * 100)
              const categoryNames = {
                product: '제품',
                human: '인물',
                nature: '자연'
              }
              return (
                <div key={category} className="card p-6 space-y-3">
                  <h3 className="font-semibold text-gray-900">
                    {categoryNames[category]}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">정답률</span>
                      <span className="font-medium text-gray-900">{percentage}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
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