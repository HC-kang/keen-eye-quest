export interface Question {
  id: number
  category: 'product' | 'human' | 'nature'
  imageId: string
  leftResolution: string
  rightResolution: string
  correctAnswer: 'left' | 'right'
  isRetest: boolean
}

const RESOLUTIONS = ['480p', '720p', '1080p', '1440p', '4k'] as const
const CATEGORIES = ['product', 'human', 'nature'] as const
const IMAGES_PER_CATEGORY = {
  product: 7,
  human: 7,
  nature: 6,
}

export function generateQuestions(): Question[] {
  const questions: Question[] = []
  let questionId = 1
  
  // 인접 해상도 비교 (15문제)
  const adjacentPairs = [
    ['480p', '720p'],
    ['720p', '1080p'],
    ['1080p', '1440p'],
    ['1440p', '4k'],
  ]
  
  let adjacentCount = 0
  for (const category of CATEGORIES) {
    const imageCount = IMAGES_PER_CATEGORY[category]
    const questionsPerCategory = category === 'nature' ? 4 : 5
    
    for (let i = 0; i < questionsPerCategory && adjacentCount < 15; i++) {
      const imageNumber = String(Math.floor(Math.random() * imageCount) + 1).padStart(2, '0')
      const pairIndex = adjacentCount % adjacentPairs.length
      const [lower, higher] = adjacentPairs[pairIndex]
      const isLeftHigher = Math.random() > 0.5
      
      questions.push({
        id: questionId++,
        category,
        imageId: `${category}-${imageNumber}`,
        leftResolution: isLeftHigher ? higher : lower,
        rightResolution: isLeftHigher ? lower : higher,
        correctAnswer: isLeftHigher ? 'left' : 'right',
        isRetest: false,
      })
      adjacentCount++
    }
  }
  
  // 2단계 차이 비교 (3문제)
  const twoStepPairs = [
    ['480p', '1080p'],
    ['720p', '1440p'],
    ['1080p', '4k'],
  ]
  
  for (let i = 0; i < 3; i++) {
    const category = CATEGORIES[i]
    const imageCount = IMAGES_PER_CATEGORY[category]
    const imageNumber = String(Math.floor(Math.random() * imageCount) + 1).padStart(2, '0')
    const [lower, higher] = twoStepPairs[i]
    const isLeftHigher = Math.random() > 0.5
    
    questions.push({
      id: questionId++,
      category,
      imageId: `${category}-${imageNumber}`,
      leftResolution: isLeftHigher ? higher : lower,
      rightResolution: isLeftHigher ? lower : higher,
      correctAnswer: isLeftHigher ? 'left' : 'right',
      isRetest: false,
    })
  }
  
  // 재검증 문제 (2문제)
  const retestIndices = [
    Math.floor(Math.random() * 10),
    Math.floor(Math.random() * 8) + 10,
  ]
  
  for (const index of retestIndices) {
    const originalQuestion = questions[index]
    questions.push({
      ...originalQuestion,
      id: questionId++,
      isRetest: true,
    })
  }
  
  return shuffleArray(questions)
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function detectDeviceInfo() {
  return {
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    pixelRatio: window.devicePixelRatio || 1,
    colorDepth: window.screen.colorDepth,
    deviceType: getDeviceType(),
    touchSupport: 'ontouchstart' in window,
    userAgent: navigator.userAgent,
    browser: getBrowser(),
    browserVersion: getBrowserVersion(),
    orientation: window.screen.orientation?.type || 'unknown',
    timestamp: new Date().toISOString(),
  }
}

function getDeviceType() {
  const width = window.screen.width
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

function getBrowser() {
  const userAgent = navigator.userAgent
  if (userAgent.includes('Chrome')) return 'chrome'
  if (userAgent.includes('Safari')) return 'safari'
  if (userAgent.includes('Firefox')) return 'firefox'
  if (userAgent.includes('Edge')) return 'edge'
  return 'other'
}

function getBrowserVersion() {
  const match = navigator.userAgent.match(/Chrome\/(\d+)/) || 
                navigator.userAgent.match(/Safari\/(\d+)/) || 
                navigator.userAgent.match(/Firefox\/(\d+)/) || 
                ['', '0']
  return match[1]
}