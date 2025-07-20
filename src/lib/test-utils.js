const RESOLUTIONS = ['480p', '720p', '1080p', '1440p', '4k']
const CATEGORIES = ['product', 'human', 'nature']
const IMAGES_PER_CATEGORY = {
  product: 7,
  human: 7,
  nature: 6,
}

export function generateQuestions() {
  const questions = []
  let questionId = 1
  
  // 모든 이미지를 사용하여 문제 생성 (20개 이미지)
  const allImages = []
  for (const category of CATEGORIES) {
    const imageCount = IMAGES_PER_CATEGORY[category]
    for (let i = 1; i <= imageCount; i++) {
      allImages.push({
        category,
        imageId: `${category}-${String(i).padStart(2, '0')}`
      })
    }
  }
  
  // 해상도 비교 쌍 정의
  const resolutionPairs = [
    ['480p', '720p'],    // 인접
    ['720p', '1080p'],   // 인접 (가장 중요)
    ['1080p', '1440p'],  // 인접
    ['1440p', '4k'],     // 인접
    ['480p', '1080p'],   // 2단계
    ['720p', '1440p'],   // 2단계
    ['1080p', '4k'],     // 2단계
    ['480p', '1440p'],   // 3단계
    ['720p', '4k'],      // 3단계
  ]
  
  // 22개 비교 문제 생성 (20개 이미지 사용, 일부 재사용)
  for (let i = 0; i < 22; i++) {
    // 처음 20개는 각 이미지 1번씩, 나머지 2개는 랜덤 재사용
    const imageIndex = i < allImages.length ? i : Math.floor(Math.random() * allImages.length)
    const { category, imageId } = allImages[imageIndex]
    const pairIndex = i % resolutionPairs.length
    const [lower, higher] = resolutionPairs[pairIndex]
    const isLeftHigher = Math.random() > 0.5
    
    questions.push({
      id: questionId++,
      category,
      imageId,
      leftResolution: isLeftHigher ? higher : lower,
      rightResolution: isLeftHigher ? lower : higher,
      correctAnswer: isLeftHigher ? 'left' : 'right',
      isRetest: false,
      testType: pairIndex < 4 ? 'adjacent' : pairIndex < 7 ? 'two-step' : 'three-step',
    })
  }
  
  // 재검증 문제 (3문제) - 기존 문제 중 랜덤 선택, 좌우 위치 변경
  const selectedForRetest = shuffleArray(questions).slice(0, 3)
  
  for (const originalQuestion of selectedForRetest) {
    // 좌우를 반대로 바꿔서 재검증
    questions.push({
      ...originalQuestion,
      id: questionId++,
      leftResolution: originalQuestion.rightResolution,
      rightResolution: originalQuestion.leftResolution,
      correctAnswer: originalQuestion.correctAnswer === 'left' ? 'right' : 'left',
      isRetest: true,
    })
  }
  
  // 문제 순서 섞기
  return shuffleArray(questions)
}

function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function detectDeviceInfo() {
  if (typeof window === 'undefined') return null
  
  const getDeviceType = () => {
    const width = window.screen.width
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }
  
  const getBrowser = () => {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Chrome')) return 'chrome'
    if (userAgent.includes('Safari')) return 'safari'
    if (userAgent.includes('Firefox')) return 'firefox'
    if (userAgent.includes('Edge')) return 'edge'
    return 'other'
  }
  
  // 시청 거리 추정 (디바이스 타입 기반)
  const getViewingDistance = () => {
    const deviceType = getDeviceType()
    switch(deviceType) {
      case 'mobile': return 30 // cm
      case 'tablet': return 40 // cm
      case 'desktop': return 60 // cm
      default: return 50
    }
  }
  
  // 화면의 물리적 크기 추정 (인치)
  const estimateScreenSize = () => {
    const width = window.screen.width
    const height = window.screen.height
    const dpi = window.devicePixelRatio * 96 // 기본 DPI * pixel ratio
    
    // 대각선 픽셀 수
    const diagonalPixels = Math.sqrt(width * width + height * height)
    // 인치로 변환
    const diagonalInches = diagonalPixels / dpi
    
    return Math.round(diagonalInches * 10) / 10
  }
  
  return {
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    pixelRatio: window.devicePixelRatio || 1,
    colorDepth: window.screen.colorDepth,
    deviceType: getDeviceType(),
    touchSupport: 'ontouchstart' in window,
    userAgent: navigator.userAgent,
    browser: getBrowser(),
    browserVersion: navigator.userAgent.match(/Chrome\/(\d+)/) || 
                     navigator.userAgent.match(/Safari\/(\d+)/) || 
                     navigator.userAgent.match(/Firefox\/(\d+)/) || 
                     ['', '0'],
    orientation: window.screen.orientation?.type || 'unknown',
    timestamp: new Date().toISOString(),
    // 추가 정보
    viewingDistance: getViewingDistance(),
    estimatedScreenSize: estimateScreenSize(),
    effectiveResolution: `${window.screen.width * window.devicePixelRatio}x${window.screen.height * window.devicePixelRatio}`,
  }
}