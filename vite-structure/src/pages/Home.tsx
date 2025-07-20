import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const [showConsent, setShowConsent] = useState(false)

  const handleStartClick = () => {
    setShowConsent(true)
  }

  const handleConsent = () => {
    navigate('/test')
  }

  const handleClose = () => {
    setShowConsent(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="card p-8 text-center space-y-6">
          {/* 로고 */}
          <div className="w-20 h-20 mx-auto bg-neutral-900 rounded-2xl flex items-center justify-center">
            <span className="text-3xl">👁️</span>
          </div>
          
          {/* 타이틀 */}
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">
              눈썰미 테스트
            </h1>
            <p className="text-lg text-neutral-600">
              당신의 이미지 감별 능력을 측정합니다
            </p>
          </div>

          {/* 설명 */}
          <p className="text-neutral-600">
            두 이미지 중 더 선명한 이미지를 선택하는 간단한 테스트를 통해
            당신의 시각적 민감도를 측정해보세요.
          </p>
          
          {/* 정보 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold">20</div>
              <div className="text-sm text-neutral-500">문제</div>
            </div>
            <div>
              <div className="text-2xl font-bold">5-7</div>
              <div className="text-sm text-neutral-500">분</div>
            </div>
            <div>
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm text-neutral-500">카테고리</div>
            </div>
          </div>

          {/* 시작 버튼 */}
          <button
            onClick={handleStartClick}
            className="btn-primary w-full"
          >
            테스트 시작하기
          </button>
        </div>
      </div>

      {/* 동의 모달 */}
      {showConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />
          
          <div className="relative w-full max-w-md">
            <div className="card p-6 space-y-4">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-bold">정보 수집 동의</h2>
                <button
                  onClick={handleClose}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-neutral-600">
                  테스트 품질 향상을 위해 다음 정보를 수집합니다:
                </p>
                
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li>• 화면 해상도 및 픽셀 밀도</li>
                  <li>• 디바이스 종류</li>
                  <li>• 브라우저 정보</li>
                  <li>• 색상 표현 능력</li>
                </ul>
                
                <div className="bg-amber-50 text-amber-800 text-sm p-3 rounded-lg">
                  💡 개인을 식별할 수 있는 정보는 수집하지 않습니다
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="btn-secondary flex-1"
                >
                  취소
                </button>
                <button
                  onClick={handleConsent}
                  className="btn-primary flex-1"
                >
                  동의하고 시작하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}