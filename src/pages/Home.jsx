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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="card p-8 sm:p-12 text-center space-y-8">
          {/* 로고 */}
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-3xl">👁️</span>
          </div>
          
          {/* 타이틀 */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
              눈썰미 테스트
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              당신의 이미지 감별 능력을 측정합니다
            </p>
          </div>

          {/* 설명 */}
          <p className="text-gray-600 max-w-md mx-auto">
            두 이미지 중 더 선명한 이미지를 선택하는 간단한 테스트를 통해
            당신의 시각적 민감도를 측정해보세요.
          </p>
          
          {/* 정보 */}
          <div className="grid grid-cols-3 gap-4 py-6">
            <div>
              <div className="text-2xl font-bold text-gray-900">25</div>
              <div className="text-sm text-gray-500">문제</div>
            </div>
            <div className="border-x border-gray-200">
              <div className="text-2xl font-bold text-gray-900">5-7</div>
              <div className="text-sm text-gray-500">분</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-sm text-gray-500">카테고리</div>
            </div>
          </div>

          {/* 시작 버튼 */}
          <button
            onClick={handleStartClick}
            className="btn-primary w-full py-4 text-base font-semibold"
          >
            테스트 시작하기
          </button>
        </div>
      </div>

      {/* 동의 모달 */}
      {showConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 백드롭 */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* 모달 콘텐츠 - relative와 z-10 추가 */}
          <div className="relative z-10 w-full max-w-md animate-scale-in">
            <div className="card p-6 sm:p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">정보 수집 동의</h2>
                  <p className="text-sm text-gray-500 mt-1">더 나은 서비스를 위한 동의</p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600">
                  테스트 품질 향상을 위해 다음 정보를 수집합니다:
                </p>
                
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                    <span className="text-gray-600">화면 해상도 및 픽셀 밀도</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                    <span className="text-gray-600">디바이스 종류 (모바일/태블릿/데스크톱)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                    <span className="text-gray-600">브라우저 정보</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                    <span className="text-gray-600">색상 표현 능력</span>
                  </li>
                </ul>
                
                <div className="bg-yellow-50 text-yellow-800 text-sm p-4 rounded-lg">
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